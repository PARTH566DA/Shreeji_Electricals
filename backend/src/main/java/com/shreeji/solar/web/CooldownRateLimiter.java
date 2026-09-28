package com.shreeji.solar.web;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-client cooldown: a client may make one accepted call per window. In-memory and
 * best-effort — correct for the single-instance deployment this site runs on. Behind a
 * load balancer you'd move this to a shared store (Redis).
 */
public class CooldownRateLimiter {

    private static final int EVICT_THRESHOLD = 1000;

    private final long windowMillis;
    private final Map<String, Long> lastAccepted = new ConcurrentHashMap<>();

    public CooldownRateLimiter(long windowSeconds) {
        this.windowMillis = Math.max(0, windowSeconds) * 1000L;
    }

    /** Remaining wait in whole seconds for this client, without starting a window. */
    public long peek(String clientId) {
        if (windowMillis <= 0) return 0;
        Long last = lastAccepted.get(clientId);
        long now = System.currentTimeMillis();
        return (last != null && now - last < windowMillis) ? ceilSeconds(windowMillis - (now - last)) : 0;
    }

    /**
     * Atomically checks the client's cooldown and, if clear, starts a fresh window.
     *
     * @return 0 if the call is allowed (window started); otherwise the whole number
     *         of seconds the client must still wait before trying again.
     */
    public long acquire(String clientId) {
        if (windowMillis <= 0) return 0; // limiter disabled via config
        long now = System.currentTimeMillis();
        long[] waitSeconds = {0L};
        lastAccepted.compute(clientId, (key, last) -> {
            if (last != null && now - last < windowMillis) {
                waitSeconds[0] = ceilSeconds(windowMillis - (now - last));
                return last;   // still cooling down — keep the original timestamp
            }
            return now;        // accepted — open a new window
        });
        if (waitSeconds[0] == 0) evictStale(now); // opportunistic cleanup on accepted calls
        return waitSeconds[0];
    }

    /** Keep the map bounded on busy days: drop clients whose window has fully elapsed. */
    private void evictStale(long now) {
        if (lastAccepted.size() < EVICT_THRESHOLD) return;
        lastAccepted.entrySet().removeIf(e -> now - e.getValue() >= windowMillis);
    }

    private static long ceilSeconds(long millis) {
        return (millis + 999) / 1000;
    }
}
