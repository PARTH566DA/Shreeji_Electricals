package com.shreeji.solar.calculator;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EstimateResponse {
    private String consumerType;
    private int recommendedKw;
    private long systemCost;
    private long centralSubsidy;
    private long stateTopUp;
    private boolean stateTopUpEnabled;
    /** First-year tax saving via accelerated depreciation (commercial only; 0 otherwise). */
    private long acceleratedDepreciationBenefit;
    private long netCost;
    private long annualUnits;
    private long annualSavings;
    private double paybackYears;
    private double co2TonnesPerYear;
    private Assumptions assumptions;
    private String disclaimer;
    private List<SavingsPoint> savingsSeries;

    @Data
    @Builder
    public static class Assumptions {
        private double tariffPerUnit;
        private int unitsPerKwYear;
    }

    @Data
    @Builder
    public static class SavingsPoint {
        private int year;
        private long cumulativeSavings;
    }
}
