package com.shreeji.solar.web;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

/**
 * Global cap on accepted calls per UTC day, across all clients. Per-IP limits alone can be
 * sidestepped by rotating addresses; this bounds the worst case (API quota, table growth).
 */
public class DailyCap {

    private final int limit;
    private LocalDate day = LocalDate.now(ZoneOffset.UTC);
    private int used;

    /** @param limit max accepted calls per UTC day; 0 or less disables the cap. */
    public DailyCap(int limit) {
        this.limit = limit;
    }

    /** Seconds until the cap resets if it is exhausted, else 0 (without consuming). */
    public synchronized long peek() {
        if (limit <= 0) return 0;
        roll();
        return used >= limit ? secondsUntilReset() : 0;
    }

    /** Consumes one slot; call only after the request has otherwise been accepted. */
    public synchronized void consume() {
        if (limit <= 0) return;
        roll();
        used++;
    }

    private void roll() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        if (!today.equals(day)) {
            day = today;
            used = 0;
        }
    }

    private static long secondsUntilReset() {
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        return Math.max(1, Duration.between(now, now.toLocalDate().plusDays(1).atStartOfDay(ZoneOffset.UTC)).toSeconds());
    }
}
