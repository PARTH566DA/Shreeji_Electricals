package com.shreeji.solar.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Single source of truth for all subsidy / tariff / cost constants (brief §4.4, §7).
 * Defaults are Gujarat estimates; override any value via {@code solar.*} in application.yml.
 *
 * IMPORTANT: Verify subsidy slabs, tariffs and state top-up against pmsuryaghar.gov.in,
 * GERC tariff orders and GEDA before going live. Figures change with policy/budget years.
 */
@Component
@ConfigurationProperties(prefix = "solar")
@Getter
@Setter
public class SolarConfig {

    /** ₹/kWh, LT-Domestic average (range 4.5–6.0). */
    private double avgTariffPerUnit = 5.5;

    /** Gujarat generation estimate (~125 units/month per kW). */
    private int unitsPerKwPerYear = 1500;

    /** recommendedKw = round(monthlyUnits / sizingDivisor). */
    private int sizingDivisor = 150;

    /** Residential net-metering cap. */
    private int maxResidentialKw = 10;

    /** Tonnes CO2 avoided per kW per year. */
    private double co2TonnesPerKwYear = 1.2;

    /** State (GEDA) top-up per kW. Keep 0 unless confirmed live; capped at stateTopupMaxKw. */
    private int stateTopupPerKw = 0;
    private int stateTopupMaxKw = 3;

    /** Sq ft of roof needed per kW (used to cap recommended size). */
    private int roofSqftPerKw = 100;

    /** Number of years for the savings projection chart. */
    private int projectionYears = 25;

    /**
     * Approximate residential cost per kW (₹), keyed by system size band.
     * Nearest band is used for in-between sizes.
     */
    private Map<Integer, Integer> costPerKwByBand = new LinkedHashMap<>(Map.of(
            1, 65000,
            2, 60000,
            3, 58000,
            5, 55000,
            10, 53000
    ));

    /** Cost per kW for a given system size — picks the nearest configured band. */
    public int costPerKw(int kw) {
        return nearestBand(costPerKwByBand, kw);
    }

    public boolean isStateTopUpEnabled() {
        return stateTopupPerKw > 0;
    }

    // ---------- Commercial / Industrial (C&I) ----------
    // PM Surya Ghar is residential-only — C&I gets NO central subsidy. The main
    // benefit is accelerated depreciation (a tax saving), plus higher commercial
    // tariffs (faster payback) and lower ₹/kW at scale. Verify all before go-live.

    /** ₹/kWh — blended LT/HT commercial tariff in Gujarat (range ~7–9). */
    private double commercialTariffPerUnit = 8.0;

    /** Practical net-metering cap for C&I (HT up to ~1 MW; above that is gross/open access). */
    private int maxCommercialKw = 1000;

    /** Year-1 depreciation on solar assets: 40% + 20% additional (>180 days) = 60%. */
    private double adDepreciationYear1 = 0.60;

    /** Effective corporate tax rate used to value the depreciation (configurable). */
    private double corporateTaxRate = 0.25;

    /** Approx. commercial cost per kW (₹), cheaper than residential at scale. */
    private Map<Integer, Integer> commercialCostPerKwByBand = new LinkedHashMap<>(Map.of(
            10, 55000,
            25, 50000,
            50, 45000,
            100, 42000,
            500, 40000,
            1000, 38000
    ));

    public int commercialCostPerKw(int kw) {
        return nearestBand(commercialCostPerKwByBand, kw);
    }

    /** First-year tax saving from accelerated depreciation on the system cost. */
    public long acceleratedDepreciationBenefit(long systemCost) {
        return Math.round(systemCost * adDepreciationYear1 * corporateTaxRate);
    }

    private static int nearestBand(Map<Integer, Integer> bands, int kw) {
        int band = bands.keySet().stream()
                .min((a, b) -> Integer.compare(Math.abs(a - kw), Math.abs(b - kw)))
                .orElse(kw);
        return bands.get(band);
    }
}
