package com.shreeji.solar.bill;

import com.shreeji.solar.calculator.CalculatorService;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * OCRs an uploaded Gujarat DISCOM bill (Tess4J/Tesseract) and regex-extracts units,
 * amount and DISCOM (brief §4.5). Best-effort: OCR never blocks the user — on any
 * failure (e.g. Tesseract not installed) it returns low confidence + a friendly
 * message so the frontend can fall back to manual entry. The image is NOT persisted.
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

    private final CalculatorService calculator;

    public BillAnalysisService(CalculatorService calculator) {
        this.calculator = calculator;
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

    public BillAnalysisResponse analyze(MultipartFile file) {
        String text;
        try {
            text = ocr(file);
        } catch (Throwable t) {
            // UnsatisfiedLinkError / missing tessdata / unreadable file — degrade gracefully.
            log.warn("Bill OCR unavailable or failed: {}", t.toString());
            return BillAnalysisResponse.builder()
                    .confidence("low")
                    .rawTextPreview("")
                    .message("We couldn't read your bill automatically. Please enter your monthly units or bill amount below.")
                    .build();
        }

        Double units = extractUnits(text);
        Double amount = extractAmount(text);
        String discom = extractDiscom(text);

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
                .rawTextPreview(preview(text))
                .message(message)
                .build();
    }

    // ---- OCR ----

    private String ocr(MultipartFile file) throws Exception {
        BufferedImage image = preprocess(toImage(file));
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

    private BufferedImage toImage(MultipartFile file) throws Exception {
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (name.endsWith(".pdf") || type.contains("pdf")) {
            try (PDDocument doc = PDDocument.load(file.getInputStream())) {
                PDFRenderer renderer = new PDFRenderer(doc);
                return renderer.renderImageWithDPI(0, 300); // first page @300 DPI
            }
        }
        BufferedImage img = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
        if (img == null) throw new IllegalArgumentException("Unsupported or unreadable image");
        return img;
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
