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
        assertEquals(37200, service.centralSubsidy(1.24));
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
        // 150 units / 150 = 1 kW, rounded up to two 620 W panels.
        assertEquals(1.24, service.recommendKw(150, null, null, max), 0.001);
        // 225 units / 150 = 1.5 kW -> ceil to three 620 W panels (1.86 kW).
        assertEquals(1.86, service.recommendKw(225, null, null, max), 0.001);
        // 300 units / 150 = 2.0 kW -> ceil to four 620 W panels (2.48 kW).
        assertEquals(2.48, service.recommendKw(300, null, null, max), 0.001);
        // 450 units / 150 = 3 kW, rounded up to five panels.
        assertEquals(3.1, service.recommendKw(450, null, null, max), 0.001);
        // Huge usage is capped at the largest whole-panel residential size below 10 kW.
        assertEquals(9.92, service.recommendKw(5000, null, null, max), 0.001);
        // Sanctioned load and roof capacity cap the number of panels.
        assertEquals(1.86, service.recommendKw(450, null, 2.0, max), 0.001);
        assertEquals(1.24, service.recommendKw(450, 150.0, null, max), 0.001);
        // Minimum recommendation is two panels to meet the 1 kW sizing floor.
        assertEquals(1.24, service.recommendKw(10, null, null, max), 0.001);
        // Commercial cap allows large systems, also in whole-panel increments.
        assertEquals(200.26, service.recommendKw(30000, null, null, cfg.getMaxCommercialKw()), 0.001);
    }

    @Test
    void deriveUnitsFromBill() {
        EstimateRequest req = new EstimateRequest();
        req.setInputType(EstimateRequest.InputType.bill);
        req.setMonthlyBill(2750.0); // /5.5 = 500 units
        assertEquals(500.0, service.deriveMonthlyUnits(req, cfg.getAvgTariffPerUnit()), 0.001);
    }

    @Test
    void fullEstimateRoundsSystemToWholePanels() {
        EstimateRequest req = new EstimateRequest();
        req.setInputType(EstimateRequest.InputType.units);
        req.setMonthlyUnits(450.0);
        req.setDiscom(Discom.MGVCL);

        EstimateResponse r = service.estimate(req);
        assertEquals(3.1, r.getRecommendedKw(), 0.001);
        assertEquals(78000, r.getCentralSubsidy());
        // 3.1 kW * 58000 = 179800 system cost
        assertEquals(179800, r.getSystemCost());
        assertEquals(179800 - 78000, r.getNetCost());
        assertEquals(4650, r.getAnnualUnits());        // 3.1 * 1500
        assertEquals(25600, r.getAnnualSavings());     // 4650 * 5.5 rounded to nearest ₹100
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
        assertEquals(100.44, r.getRecommendedKw(), 0.001);
        assertEquals(0, r.getCentralSubsidy());          // no PM Surya Ghar for C&I
        assertEquals(4_218_500, r.getSystemCost());      // 100.44 * 42000 rounded to ₹100
        assertEquals(632_800, r.getAcceleratedDepreciationBenefit());
        assertEquals(3_585_700, r.getNetCost());         // systemCost - AD benefit, rounded to ₹100
        assertEquals(150_660, r.getAnnualUnits());       // 100.44 * 1500
        assertEquals(1_205_300, r.getAnnualSavings());   // 150660 * 8.0 rounded to ₹100
        assertEquals(3.0, r.getPaybackYears());
        assertEquals(8.0, r.getAssumptions().getTariffPerUnit());
    }

    @Test
    void acceleratedDepreciationBenefitFormula() {
        assertEquals(150000, cfg.acceleratedDepreciationBenefit(1_000_000)); // 1M * 0.6 * 0.25
    }
}
