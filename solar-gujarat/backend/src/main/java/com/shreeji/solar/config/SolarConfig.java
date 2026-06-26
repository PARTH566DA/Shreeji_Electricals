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
        int nearestBand = costPerKwByBand.keySet().stream()
                .min((a, b) -> Integer.compare(Math.abs(a - kw), Math.abs(b - kw)))
                .orElse(kw);
        return costPerKwByBand.get(nearestBand);
    }

    public boolean isStateTopUpEnabled() {
        return stateTopupPerKw > 0;
    }
}
