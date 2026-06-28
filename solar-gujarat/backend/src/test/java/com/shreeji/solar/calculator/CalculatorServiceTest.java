package com.shreeji.solar.calculator;

import com.shreeji.solar.config.SolarConfig;
import com.shreeji.solar.model.Discom;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CalculatorServiceTest {

    private final SolarConfig cfg = new SolarConfig();
    private final CalculatorService service = new CalculatorService(cfg);

    // --- Central subsidy slab (brief acceptance criterion) ---
    @Test
    void centralSubsidySlab() {
        assertEquals(30000, service.centralSubsidy(1));
        assertEquals(60000, service.centralSubsidy(2));
        assertEquals(78000, service.centralSubsidy(3));
        assertEquals(78000, service.centralSubsidy(5));
        assertEquals(78000, service.centralSubsidy(10)); // hard cap holds above 3 kW
    }

    @Test
    void stateTopUpDisabledByDefault() {
        assertFalse(cfg.isStateTopUpEnabled());
        assertEquals(0, service.stateTopUp(3));
    }

    @Test
    void stateTopUpCapsAtMaxKwWhenEnabled() {
        cfg.setStateTopupPerKw(10000); // GEDA top-up hypothetical
        assertEquals(30000, service.stateTopUp(5)); // capped at 3 kW * 10000
        assertEquals(10000, service.stateTopUp(1));
    }

    @Test
    void recommendedSizeFromUnitsAndClamps() {
        int max = cfg.getMaxResidentialKw();
        // 450 units / 150 = 3 kW
        assertEquals(3, service.recommendKw(450, null, null, max));
        // huge usage clamps to residential max 10 kW
        assertEquals(10, service.recommendKw(5000, null, null, max));
        // sanctioned load caps it
        assertEquals(2, service.recommendKw(450, null, 2.0, max));
        // roof area caps it: 150 sq ft -> floor(150/100)=1 kW
        assertEquals(1, service.recommendKw(450, 150.0, null, max));
        // floor at 1 kW
        assertEquals(1, service.recommendKw(10, null, null, max));
        // commercial cap allows large systems: 30000 units / 150 = 200 kW
        assertEquals(200, service.recommendKw(30000, null, null, cfg.getMaxCommercialKw()));
    }

    @Test
    void deriveUnitsFromBill() {
        EstimateRequest req = new EstimateRequest();
        req.setInputType(EstimateRequest.InputType.bill);
        req.setMonthlyBill(2750.0); // /5.5 = 500 units
        assertEquals(500.0, service.deriveMonthlyUnits(req, cfg.getAvgTariffPerUnit()), 0.001);
    }

    @Test
    void fullEstimateAt3kw() {
        EstimateRequest req = new EstimateRequest();
        req.setInputType(EstimateRequest.InputType.units);
        req.setMonthlyUnits(450.0);
        req.setDiscom(Discom.MGVCL);

        EstimateResponse r = service.estimate(req);
        assertEquals(3, r.getRecommendedKw());
        assertEquals(78000, r.getCentralSubsidy());
        // 3 kW * 58000 = 174000 system cost
        assertEquals(174000, r.getSystemCost());
        assertEquals(174000 - 78000, r.getNetCost());
        assertEquals(4500, r.getAnnualUnits());        // 3 * 1500
        assertEquals(24800, r.getAnnualSavings());     // 4500 * 5.5 = 24750, rounded to nearest ₹100
        assertEquals(26, r.getSavingsSeries().size()); // years 0..25
        assertTrue(r.getPaybackYears() > 0);
        assertFalse(r.isStateTopUpEnabled());
        assertEquals("RESIDENTIAL", r.getConsumerType());
        assertEquals(0, r.getAcceleratedDepreciationBenefit());
    }

    // --- Commercial / industrial (no subsidy, accelerated depreciation) ---
    @Test
    void commercialEstimateAt100kw() {
        EstimateRequest req = new EstimateRequest();
        req.setInputType(EstimateRequest.InputType.units);
        req.setMonthlyUnits(15000.0); // 15000 / 150 = 100 kW
        req.setDiscom(Discom.DGVCL);
        req.setConsumerType(ConsumerType.COMMERCIAL);

        EstimateResponse r = service.estimate(req);
        assertEquals("COMMERCIAL", r.getConsumerType());
        assertEquals(100, r.getRecommendedKw());
        assertEquals(0, r.getCentralSubsidy());          // no PM Surya Ghar for C&I
        assertEquals(4_200_000, r.getSystemCost());      // 100 * 42000
        assertEquals(630_000, r.getAcceleratedDepreciationBenefit()); // 4.2M * 0.6 * 0.25
        assertEquals(3_570_000, r.getNetCost());         // systemCost - AD benefit
        assertEquals(150_000, r.getAnnualUnits());       // 100 * 1500
        assertEquals(1_200_000, r.getAnnualSavings());   // 150000 * 8.0
        assertEquals(3.0, r.getPaybackYears());          // 3.57M / 1.2M ≈ 2.975 -> 3.0
        assertEquals(8.0, r.getAssumptions().getTariffPerUnit());
    }

    @Test
    void acceleratedDepreciationBenefitFormula() {
        assertEquals(150000, cfg.acceleratedDepreciationBenefit(1_000_000)); // 1M * 0.6 * 0.25
    }
}
