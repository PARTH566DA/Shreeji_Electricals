package com.shreeji.solar.bill;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/bill")
@Tag(name = "Bill OCR", description = "Read a Gujarat DISCOM electricity bill and auto-size a system")
public class BillController {

    private final BillAnalysisService service;

    public BillController(BillAnalysisService service) {
        this.service = service;
    }

    @Operation(summary = "Analyze an uploaded bill (JPG/PNG/PDF). Best-effort OCR; never blocks.")
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BillAnalysisResponse analyze(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return BillAnalysisResponse.builder()
                    .confidence("low")
                    .rawTextPreview("")
                    .message("No file received. Please enter your monthly units or bill amount manually.")
                    .build();
        }
        return service.analyze(file);
    }
}
