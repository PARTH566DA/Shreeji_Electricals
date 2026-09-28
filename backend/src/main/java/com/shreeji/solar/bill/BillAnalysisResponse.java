package com.shreeji.solar.bill;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BillAnalysisResponse {
    private Double detectedUnits;
    private Double detectedAmount;
    private String detectedDiscom;
    private String confidence;       // high | medium | low
    private Integer recommendedKw;
    private String rawTextPreview;
    private String message;
}
