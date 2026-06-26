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
        // 450 units / 150 = 3 kW
        assertEquals(3, service.recommendKw(450, null, null));
        // huge usage clamps to residential max 10 kW
        assertEquals(10, service.recommendKw(5000, null, null));
        // sanctioned load caps it
        assertEquals(2, service.recommendKw(450, null, 2.0));
        // roof area caps it: 150 sq ft -> floor(150/100)=1 kW
        assertEquals(1, service.recommendKw(450, 150.0, null));
        // floor at 1 kW
        assertEquals(1, service.recommendKw(10, null, null));
    }

    @Test
    void deriveUnitsFromBill() {
        EstimateRequest req = new EstimateRequest();
        req.setInputType(EstimateRequest.InputType.bill);
        req.setMonthlyBill(2750.0); // /5.5 = 500 units
        assertEquals(500.0, service.deriveMonthlyUnits(req), 0.001);
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
    }
}
