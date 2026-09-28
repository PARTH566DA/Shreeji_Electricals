package com.shreeji.solar.bill;

import com.shreeji.solar.web.TooManyRequestsException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/bill")
@Tag(name = "Bill OCR", description = "Read a Gujarat DISCOM electricity bill and auto-size a system")
public class BillController {

    private final BillAnalysisService service;
    private final BillRateLimiter rateLimiter;

    @Value("${app.trust-forwarded-headers:false}")
    private boolean trustForwardedHeaders;

    public BillController(BillAnalysisService service, BillRateLimiter rateLimiter) {
        this.service = service;
        this.rateLimiter = rateLimiter;
    }

    @Operation(summary = "Analyze an uploaded bill (JPG/PNG/PDF). Best-effort OCR; never blocks. "
            + "Rate-limited to one accepted upload per client per minute to protect the vision-API quota.")
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BillAnalysisResponse analyze(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        // Empty uploads never reach the vision API, so they don't consume the client's quota window.
        if (file == null || file.isEmpty()) {
            return BillAnalysisResponse.builder()
                    .confidence("low")
                    .rawTextPreview("")
                    .message("No file received. Please enter your monthly units or bill amount manually.")
                    .build();
        }
        String contentType = file.getContentType();
        if (!MediaType.IMAGE_JPEG_VALUE.equals(contentType)
                && !MediaType.IMAGE_PNG_VALUE.equals(contentType)
                && !MediaType.APPLICATION_PDF_VALUE.equals(contentType)) {
            throw new IllegalArgumentException("Only JPG, PNG, and PDF files are supported");
        }
        long waitSeconds = rateLimiter.acquire(clientId(request));
        if (waitSeconds > 0) {
            throw new TooManyRequestsException(waitSeconds,
                    "Please wait " + waitSeconds + " more second" + (waitSeconds == 1 ? "" : "s")
                            + " before uploading another bill.");
        }
        return service.analyze(file);
    }

    /** Use forwarded client IP only when the deployment is explicitly behind a trusted proxy. */
    private String clientId(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (trustForwardedHeaders && forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
