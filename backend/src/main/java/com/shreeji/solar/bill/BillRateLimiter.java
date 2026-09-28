package com.shreeji.solar.bill;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-client cooldown for the bill-analysis endpoint. Every accepted upload costs
 * one Gemini vision call, so we allow a single client (identified by IP) at most
 * one accepted upload per window (default 60s). This stops one visitor from
 * spamming photos and draining the limited daily API quota.
 *
 * <p>In-memory and best-effort — correct for the single-instance deployment this
 * site runs on. Behind a load balancer you'd move this to a shared store (Redis).
 */
@Component
public class BillRateLimiter {

    private final long windowMillis;
    private final Map<String, Long> lastAccepted = new ConcurrentHashMap<>();

    public BillRateLimiter(@Value("${app.bill.rate-limit.window-seconds:60}") long windowSeconds) {
        this.windowMillis = Math.max(0, windowSeconds) * 1000L;
    }

    /**
     * Atomically checks the client's cooldown and, if clear, starts a fresh window.
     *
     * @param clientId stable per-client key (IP address)
     * @return 0 if the call is allowed (window started); otherwise the whole number
     *         of seconds the client must still wait before trying again.
     */
    public long acquire(String clientId) {
        if (windowMillis <= 0) return 0; // limiter disabled via config
        long now = System.currentTimeMillis();
        long[] waitSeconds = {0L};
        lastAccepted.compute(clientId, (key, last) -> {
            if (last != null && now - last < windowMillis) {
                waitSeconds[0] = (windowMillis - (now - last) + 999) / 1000; // ceil to seconds
                return last;   // still cooling down — keep the original timestamp
            }
            return now;        // accepted — open a new window
        });
        if (waitSeconds[0] == 0) evictStale(now); // opportunistic cleanup on accepted calls
        return waitSeconds[0];
    }

    /** Keep the map bounded on busy days: drop clients whose window has fully elapsed. */
    private void evictStale(long now) {
        if (lastAccepted.size() < 1000) return;
        lastAccepted.entrySet().removeIf(e -> now - e.getValue() >= windowMillis);
    }
}
