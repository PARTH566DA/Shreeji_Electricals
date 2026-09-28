package com.shreeji.solar.bill;

import com.shreeji.solar.calculator.CalculatorService;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.Iterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Reads an uploaded Gujarat DISCOM bill and extracts units, amount and DISCOM
 * (brief §4.5). Preferred path is Gemini vision ({@link GeminiBillExtractor}),
 * which handles handwritten Gujarati and unclear phone photos; when no API key
 * is configured (or the call fails) it falls back to local Tess4J/Tesseract OCR
 * + regex, which works for printed bills only. Best-effort: analysis never
 * blocks the user — on any failure it returns low confidence + a friendly
 * message so the frontend can fall back to manual entry. The image is NOT
 * persisted by us.
 */
@Service
public class BillAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(BillAnalysisService.class);

    // Candidate tessdata locations (brew / linux / env). First that exists wins.
    private static final String[] TESSDATA_PATHS = {
            System.getenv("TESSDATA_PREFIX"),
            "/opt/homebrew/share/tessdata",
            "/usr/local/share/tessdata",
            "/usr/share/tesseract-ocr/5/tessdata",
            "/usr/share/tesseract-ocr/4.00/tessdata",
            "/usr/share/tessdata",
    };

    // Dirs where Homebrew / Linux place libtesseract; added to jna.library.path so
    // Tess4J's native binding can find it (otherwise UnsatisfiedLinkError).
    private static final String[] NATIVE_LIB_DIRS = {
            "/opt/homebrew/lib", "/usr/local/lib", "/usr/lib", "/usr/lib/x86_64-linux-gnu",
    };

    // Upper bound on decoded/rendered pixels. A small, highly compressed PNG or a PDF with a
    // huge page box can otherwise expand into gigabytes and OOM the JVM (decompression bomb).
    static final long MAX_PIXELS = 16_000_000L;

    private final CalculatorService calculator;
    private final GeminiBillExtractor gemini;

    public BillAnalysisService(CalculatorService calculator, GeminiBillExtractor gemini) {
        this.calculator = calculator;
        this.gemini = gemini;
        configureNativeLibraryPath();
    }

    /** Ensure JNA can locate libtesseract before TessAPI initialises (runs at startup). */
    private static void configureNativeLibraryPath() {
        StringBuilder path = new StringBuilder(System.getProperty("jna.library.path", ""));
        for (String dir : NATIVE_LIB_DIRS) {
            File d = new File(dir);
            boolean hasLib = new File(d, "libtesseract.dylib").exists()
                    || new File(d, "libtesseract.so").exists()
                    || new File(d, "libtesseract.5.dylib").exists();
            if (d.isDirectory() && hasLib) {
                if (path.length() > 0) path.append(File.pathSeparator);
                path.append(dir);
            }
        }
        if (path.length() > 0) {
            System.setProperty("jna.library.path", path.toString());
        }
    }

    /** @param mimeType type detected from the file's magic bytes (image/jpeg, image/png, application/pdf) */
    public BillAnalysisResponse analyze(MultipartFile file, String mimeType) {
        boolean pdf = "application/pdf".equals(mimeType);
        // 1) Preferred: Gemini vision — reads handwritten Gujarati and unclear photos.
        if (gemini.isConfigured()) {
            BillAnalysisResponse viaGemini = analyzeWithGemini(file, pdf, mimeType);
            if (viaGemini != null) return viaGemini;
            log.warn("Gemini analysis unavailable — falling back to local OCR");
        }

        // 2) Fallback: local Tesseract OCR + regex (printed bills only).
        String text;
        try {
            text = ocr(file, pdf);
        } catch (Throwable t) {
            // UnsatisfiedLinkError / missing tessdata / unreadable file — degrade gracefully.
            log.warn("Bill OCR unavailable or failed: {}", t.toString());
            return BillAnalysisResponse.builder()
                    .confidence("low")
                    .rawTextPreview("")
                    .message("We couldn't read your bill automatically. Please enter your monthly units or bill amount below.")
                    .build();
        }
        return buildResponse(extractUnits(text), extractAmount(text), extractDiscom(text), preview(text));
    }

    // ---- Gemini vision path ----

    /** Returns null on any failure so analyze() can fall back to local OCR. */
    private BillAnalysisResponse analyzeWithGemini(MultipartFile file, boolean pdf, String mimeType) {
        try {
            byte[] bytes;
            String mime;
            if (pdf) {
                // Rasterise the first page — Gemini takes images, and 200 DPI is plenty.
                BufferedImage page = renderFirstPage(file.getBytes(), 200, ImageType.RGB);
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                ImageIO.write(page, "jpg", out);
                bytes = out.toByteArray();
                mime = "image/jpeg";
            } else {
                // Send the original photo untouched — re-encoding only loses detail.
                bytes = file.getBytes();
                mime = mimeType;
            }

            GeminiBillExtractor.Extraction ex = gemini.extract(bytes, mime);
            if (ex == null) return null;
            if (!ex.legible()) {
                return BillAnalysisResponse.builder()
                        .confidence("low")
                        .rawTextPreview("")
                        .message("The photo is too unclear to read. Please retake it in good light, or enter your monthly units or bill amount below.")
                        .build();
            }
            return buildResponse(ex.units(), ex.amount(), ex.discom(), "");
        } catch (Exception e) {
            log.warn("Gemini bill analysis failed: {}", e.toString());
            return null;
        }
    }

    /** Shared by the Gemini and OCR paths: recommendation + confidence + message. */
    private BillAnalysisResponse buildResponse(Double units, Double amount, String discom, String rawPreview) {
        Integer recommendedKw = null;
        double monthlyUnits = -1;
        if (units != null && units > 0) {
            monthlyUnits = units;
        } else if (amount != null && amount > 0) {
            monthlyUnits = calculator.unitsFromBill(amount);
        }
        if (monthlyUnits > 0) {
            recommendedKw = calculator.recommendKw(monthlyUnits);
        }

        String confidence;
        String message;
        if (units != null && amount != null) {
            confidence = "high";
            message = "We read your bill. Please confirm the values below before calculating.";
        } else if (units != null || amount != null) {
            confidence = "medium";
            message = "We read part of your bill. Please check and complete the values below.";
        } else {
            confidence = "low";
            message = "We couldn't confidently read your bill. Please enter your monthly units or bill amount below.";
        }

        return BillAnalysisResponse.builder()
                .detectedUnits(units)
                .detectedAmount(amount)
                .detectedDiscom(discom)
                .confidence(confidence)
                .recommendedKw(recommendedKw)
                .rawTextPreview(rawPreview)
                .message(message)
                .build();
    }

    // ---- OCR ----

    private String ocr(MultipartFile file, boolean pdf) throws Exception {
        BufferedImage image = preprocess(toImage(file, pdf));
        Tesseract tess = new Tesseract();
        String datapath = firstExistingTessdata();
        if (datapath != null) {
            tess.setDatapath(datapath);
        }
        // Read English + Gujarati (labels are in Gujarati script) when guj data is present.
        tess.setLanguage(resolveLanguages(datapath));
        tess.setPageSegMode(3);              // fully automatic page segmentation
        tess.setOcrEngineMode(1);            // LSTM engine
        tess.setVariable("user_defined_dpi", "300"); // avoids "invalid resolution" guesses on photos
        return tess.doOCR(image);
    }

    /** "eng+guj" if Gujarati trained data is available, else "eng". */
    private String resolveLanguages(String datapath) {
        if (datapath != null && new File(datapath, "guj.traineddata").exists()) {
            return "eng+guj";
        }
        return "eng";
    }

    /**
     * Light preprocessing to help OCR on phone photos: upscale small images and
     * convert to grayscale so Tesseract's internal thresholding works on cleaner input.
     * (Handwritten / heavily skewed / dot-matrix bills will still need manual entry.)
     */
    private BufferedImage preprocess(BufferedImage src) {
        int targetWidth = 2000;
        double scale = src.getWidth() < targetWidth ? (double) targetWidth / src.getWidth() : 1.0;
        scale = Math.min(scale, 3.0);
        // Never upscale past the pixel budget (e.g. a very tall, narrow image).
        scale = Math.min(scale, Math.sqrt((double) MAX_PIXELS / ((long) src.getWidth() * src.getHeight())));
        int w = (int) Math.round(src.getWidth() * scale);
        int h = (int) Math.round(src.getHeight() * scale);

        BufferedImage gray = new BufferedImage(w, h, BufferedImage.TYPE_BYTE_GRAY);
        var g = gray.createGraphics();
        g.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION,
                java.awt.RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.drawImage(src, 0, 0, w, h, null);
        g.dispose();
        return gray;
    }

    private BufferedImage toImage(MultipartFile file, boolean pdf) throws Exception {
        if (pdf) {
            return renderFirstPage(file.getBytes(), 300, ImageType.RGB); // first page @300 DPI
        }
        return readImageBounded(file.getBytes());
    }

    /** Renders page 1 at the requested DPI, lowered if needed to stay within MAX_PIXELS. */
    static BufferedImage renderFirstPage(byte[] pdfBytes, float dpi, ImageType type) throws Exception {
        try (PDDocument doc = Loader.loadPDF(pdfBytes)) {
            if (doc.getNumberOfPages() < 1) throw new IllegalArgumentException("PDF has no pages");
            PDRectangle box = doc.getPage(0).getCropBox();
            double areaInches = (box.getWidth() / 72.0) * (box.getHeight() / 72.0);
            if (!(areaInches > 0)) throw new IllegalArgumentException("PDF page has no area");
            float safeDpi = (float) Math.min(dpi, Math.sqrt(MAX_PIXELS / areaInches));
            if (safeDpi < 36) throw new IllegalArgumentException("PDF page is too large");
            return new PDFRenderer(doc).renderImageWithDPI(0, safeDpi, type);
        }
    }

    /** Reads the image header first and refuses to decode anything over MAX_PIXELS. */
    static BufferedImage readImageBounded(byte[] bytes) throws Exception {
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            Iterator<ImageReader> readers = in == null ? null : ImageIO.getImageReaders(in);
            if (readers == null || !readers.hasNext()) {
                throw new IllegalArgumentException("Unsupported or unreadable image");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(in, true, true);
                long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                if (pixels <= 0 || pixels > MAX_PIXELS) {
                    throw new IllegalArgumentException("Image dimensions are too large");
                }
                return reader.read(0);
            } finally {
                reader.dispose();
            }
        }
    }

    private String firstExistingTessdata() {
        for (String p : TESSDATA_PATHS) {
            if (p != null && !p.isBlank() && new File(p).isDirectory()) return p;
        }
        return null;
    }

    // ---- Extraction ----

    // Labels in English and Gujarati. Gujarati: વપરાશ (usage/consumption), યુનિટ (unit).
    private static final Pattern UNITS = Pattern.compile(
            "(?:units\\s*consumed|total\\s*units|consumption|net\\s*units|units|વપરાશ|યુનિટ)\\D{0,12}(\\d{2,5})",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern UNITS_KWH = Pattern.compile(
            "(\\d{2,5})\\s*(?:kwh|units|યુનિટ)", Pattern.CASE_INSENSITIVE);
    // Gujarati: ચૂકવવાની રકમ / ભરવાની રકમ / કુલ રકમ (amount payable / total).
    private static final Pattern AMOUNT = Pattern.compile(
            "(?:net\\s*payable|amount\\s*payable|bill\\s*amount|total\\s*payable|net\\s*amount|total|ચૂકવવાની\\s*રકમ|ભરવાની\\s*રકમ|કુલ\\s*રકમ|રકમ)\\D{0,12}(?:rs\\.?|inr|₹|રૂ\\.?)?\\s*([\\d,]{2,9}(?:\\.\\d{1,2})?)",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern DISCOM_CODE = Pattern.compile(
            "\\b(MGVCL|DGVCL|UGVCL|PGVCL)\\b", Pattern.CASE_INSENSITIVE);

    Double extractUnits(String text) {
        Matcher m = UNITS.matcher(text);
        if (m.find()) return safeDouble(m.group(1));
        Matcher k = UNITS_KWH.matcher(text);
        if (k.find()) return safeDouble(k.group(1));
        return null;
    }

    Double extractAmount(String text) {
        Matcher m = AMOUNT.matcher(text);
        Double best = null;
        while (m.find()) {
            Double v = safeDouble(m.group(1).replace(",", ""));
            if (v != null && (best == null || v > best)) best = v; // net payable is usually the largest
        }
        return best;
    }

    String extractDiscom(String text) {
        Matcher m = DISCOM_CODE.matcher(text);
        if (m.find()) return m.group(1).toUpperCase();
        String lower = text.toLowerCase();
        // English transliterations + DISCOM website domains.
        if (lower.contains("madhya gujarat") || lower.contains("mgvcl.com")) return "MGVCL";
        if (lower.contains("dakshin gujarat") || lower.contains("dgvcl.com")) return "DGVCL";
        if (lower.contains("uttar gujarat") || lower.contains("ugvcl.com")) return "UGVCL";
        if (lower.contains("paschim gujarat") || lower.contains("pgvcl.com")) return "PGVCL";
        // Gujarati script names.
        if (text.contains("મધ્ય ગુજરાત")) return "MGVCL";
        if (text.contains("દક્ષિણ ગુજરાત")) return "DGVCL";
        if (text.contains("ઉત્તર ગુજરાત")) return "UGVCL";
        if (text.contains("પશ્ચિમ ગુજરાત")) return "PGVCL";
        return null;
    }

    private static Double safeDouble(String s) {
        try {
            return Double.valueOf(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String preview(String text) {
        if (text == null) return "";
        String trimmed = text.strip().replaceAll("\\s+\n", "\n");
        return trimmed.length() > 600 ? trimmed.substring(0, 600) + "…" : trimmed;
    }
}
