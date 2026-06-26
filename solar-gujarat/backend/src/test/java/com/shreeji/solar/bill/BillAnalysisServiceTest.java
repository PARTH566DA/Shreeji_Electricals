package com.shreeji.solar.bill;

import com.shreeji.solar.calculator.CalculatorService;
import com.shreeji.solar.config.SolarConfig;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BillAnalysisServiceTest {

    private final BillAnalysisService svc =
            new BillAnalysisService(new CalculatorService(new SolarConfig()));

    @Test
    void extractsUnitsAmountAndDiscom() {
        String text = """
                MADHYA GUJARAT VIJ COMPANY LTD  (MGVCL)
                Consumer No: 1234567890
                Units Consumed: 452
                Net Payable Rs. 2,486.00
                """;
        assertEquals(452.0, svc.extractUnits(text));
        assertEquals(2486.0, svc.extractAmount(text));
        assertEquals("MGVCL", svc.extractDiscom(text));
    }

    @Test
    void detectsDiscomByLongName() {
        assertEquals("DGVCL", svc.extractDiscom("Dakshin Gujarat Vij Company"));
        assertEquals("PGVCL", svc.extractDiscom("paschim gujarat vij"));
    }

    @Test
    void handlesKwhUnitsAndMissingFields() {
        assertEquals(310.0, svc.extractUnits("Total consumption 310 kWh this month"));
        assertNull(svc.extractDiscom("no discom mentioned here"));
    }
}
