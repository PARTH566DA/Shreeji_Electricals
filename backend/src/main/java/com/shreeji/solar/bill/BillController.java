package com.shreeji.solar.bill;

import com.shreeji.solar.web.ClientIpResolver;
import com.shreeji.solar.web.TooManyRequestsException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.concurrent.Semaphore;

@RestController
@RequestMapping("/api/bill")
@Tag(name = "Bill OCR", description = "Read a Gujarat DISCOM electricity bill and auto-size a system")
public class BillController {

    private final BillAnalysisService service;
    private final BillRateLimiter rateLimiter;
    private final ClientIpResolver clientIp;
    // OCR/PDF rendering is memory- and CPU-heavy; cap simultaneous analyses.
    private final Semaphore inFlight;

    public BillController(BillAnalysisService service, BillRateLimiter rateLimiter, ClientIpResolver clientIp,
                          @Value("${app.bill.max-concurrent:2}") int maxConcurrent) {
        this.service = service;
        this.rateLimiter = rateLimiter;
        this.clientIp = clientIp;
        this.inFlight = new Semaphore(Math.max(1, maxConcurrent));
    }

    @Operation(summary = "Analyze an uploaded bill (JPG/PNG/PDF). Best-effort OCR; never blocks. "
            + "Rate-limited to one accepted upload per client per minute to protect the vision-API quota.")
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BillAnalysisResponse analyze(@RequestParam("file") MultipartFile file, HttpServletRequest request)
            throws IOException {
        // Empty uploads never reach the vision API, so they don't consume the client's quota window.
        if (file == null || file.isEmpty()) {
            return BillAnalysisResponse.builder()
                    .confidence("low")
                    .rawTextPreview("")
                    .message("No file received. Please enter your monthly units or bill amount manually.")
                    .build();
        }
        // Trust the bytes, not the client-supplied Content-Type / filename.
        String sniffed = sniffType(file);
        if (sniffed == null) {
            throw new IllegalArgumentException("Only JPG, PNG, and PDF files are supported");
        }
        long waitSeconds = rateLimiter.acquire(clientIp.resolve(request));
        if (waitSeconds > 0) {
            throw new TooManyRequestsException(waitSeconds,
                    "Please wait " + waitSeconds + " more second" + (waitSeconds == 1 ? "" : "s")
                            + " before uploading another bill.");
        }
        if (!inFlight.tryAcquire()) {
            throw new TooManyRequestsException(10, "Our bill reader is busy. Please try again in a few seconds.");
        }
        try {
            return service.analyze(file, sniffed);
        } finally {
            inFlight.release();
        }
    }

    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] PDF = {'%', 'P', 'D', 'F', '-'};

    /** Returns the MIME type detected from magic bytes, or null if not JPG/PNG/PDF. */
    static String sniffType(MultipartFile file) throws IOException {
        byte[] head = new byte[8];
        int n;
        try (InputStream in = file.getInputStream()) {
            n = in.readNBytes(head, 0, head.length);
        }
        if (startsWith(head, n, JPEG)) return MediaType.IMAGE_JPEG_VALUE;
        if (startsWith(head, n, PNG)) return MediaType.IMAGE_PNG_VALUE;
        if (startsWith(head, n, PDF)) return MediaType.APPLICATION_PDF_VALUE;
        return null;
    }

    private static boolean startsWith(byte[] head, int n, byte[] magic) {
        return n >= magic.length && Arrays.equals(head, 0, magic.length, magic, 0, magic.length);
    }
}
