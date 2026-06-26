package com.shreeji.solar.calculator;

import com.shreeji.solar.config.SolarConfig;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Cost & subsidy estimation (brief §4.4). All constants come from {@link SolarConfig};
 * no scattered magic numbers here.
 */
@Service
public class CalculatorService {

    private static final String DISCLAIMER =
            "Estimates only, based on average Gujarat generation and tariffs. Final figures depend " +
            "on your roof, DISCOM tariff slab, and live subsidy rules.";

    private final SolarConfig cfg;

    public CalculatorService(SolarConfig cfg) {
        this.cfg = cfg;
    }

    public EstimateResponse estimate(EstimateRequest req) {
        double monthlyUnits = deriveMonthlyUnits(req);
        int recommendedKw = recommendKw(monthlyUnits, req.getRoofAreaSqft(), req.getSanctionedLoadKw());

        long centralSubsidy = centralSubsidy(recommendedKw);
        long stateTopUp = stateTopUp(recommendedKw);

        long systemCost = roundTo100((long) recommendedKw * cfg.costPerKw(recommendedKw));
        long netCost = roundTo100(systemCost - centralSubsidy - stateTopUp);
        long annualUnits = (long) recommendedKw * cfg.getUnitsPerKwPerYear();
        long annualSavings = roundTo100(Math.round(annualUnits * cfg.getAvgTariffPerUnit()));
        double paybackYears = annualSavings > 0 ? round1((double) netCost / annualSavings) : 0;
        double co2 = round1(recommendedKw * cfg.getCo2TonnesPerKwYear());

        return EstimateResponse.builder()
                .recommendedKw(recommendedKw)
                .systemCost(systemCost)
                .centralSubsidy(centralSubsidy)
                .stateTopUp(stateTopUp)
                .stateTopUpEnabled(cfg.isStateTopUpEnabled())
                .netCost(netCost)
                .annualUnits(annualUnits)
                .annualSavings(annualSavings)
                .paybackYears(paybackYears)
                .co2TonnesPerYear(co2)
                .assumptions(EstimateResponse.Assumptions.builder()
                        .tariffPerUnit(cfg.getAvgTariffPerUnit())
                        .unitsPerKwYear(cfg.getUnitsPerKwPerYear())
                        .build())
                .disclaimer(DISCLAIMER)
                .savingsSeries(savingsSeries(annualSavings))
                .build();
    }

    double deriveMonthlyUnits(EstimateRequest req) {
        if (req.getInputType() == EstimateRequest.InputType.units) {
            if (req.getMonthlyUnits() == null) {
                throw new IllegalArgumentException("monthlyUnits is required when inputType=units");
            }
            return req.getMonthlyUnits();
        }
        if (req.getMonthlyBill() == null) {
            throw new IllegalArgumentException("monthlyBill is required when inputType=bill");
        }
        return req.getMonthlyBill() / cfg.getAvgTariffPerUnit();
    }

    /** Recommended size from monthly units alone (used by bill OCR sizing). */
    public int recommendKw(double monthlyUnits) {
        return recommendKw(monthlyUnits, null, null);
    }

    /** Convert a monthly bill (₹) to estimated monthly units. */
    public double unitsFromBill(double monthlyBill) {
        return monthlyBill / cfg.getAvgTariffPerUnit();
    }

    /** recommendedKw = round(monthlyUnits / divisor), clamped to caps. */
    int recommendKw(double monthlyUnits, Double roofAreaSqft, Double sanctionedLoadKw) {
        int kw = (int) Math.round(monthlyUnits / cfg.getSizingDivisor());
        kw = Math.max(1, Math.min(kw, cfg.getMaxResidentialKw()));
        if (sanctionedLoadKw != null) {
            kw = Math.min(kw, Math.max(1, (int) Math.floor(sanctionedLoadKw)));
        }
        if (roofAreaSqft != null) {
            int roofCap = (int) Math.floor(roofAreaSqft / cfg.getRoofSqftPerKw());
            kw = Math.min(kw, Math.max(1, roofCap));
        }
        return Math.max(1, kw);
    }

    /** PM Surya Ghar exact slab: 1kW→30000, 2kW→60000, 3kW+→78000 (hard cap). */
    long centralSubsidy(int recommendedKw) {
        int k = Math.min(recommendedKw, 3);
        long central = (k <= 2) ? (long) k * 30000 : 60000 + (long) (k - 2) * 18000;
        return Math.min(central, 78000);
    }

    long stateTopUp(int recommendedKw) {
        if (!cfg.isStateTopUpEnabled()) return 0;
        return (long) Math.min(recommendedKw, cfg.getStateTopupMaxKw()) * cfg.getStateTopupPerKw();
    }

    private List<EstimateResponse.SavingsPoint> savingsSeries(long annualSavings) {
        List<EstimateResponse.SavingsPoint> series = new ArrayList<>();
        for (int year = 0; year <= cfg.getProjectionYears(); year++) {
            series.add(EstimateResponse.SavingsPoint.builder()
                    .year(year)
                    .cumulativeSavings(annualSavings * year)
                    .build());
        }
        return series;
    }

    private static long roundTo100(long v) {
        return Math.round(v / 100.0) * 100;
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
