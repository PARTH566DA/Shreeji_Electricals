package com.shreeji.solar.bill;

import com.shreeji.solar.web.CooldownRateLimiter;
import com.shreeji.solar.web.DailyCap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Limits for the bill-analysis endpoint. Every accepted upload costs one Gemini vision
 * call, so a single client (identified by IP, or IPv6 /64) gets at most one accepted
 * upload per window (default 60s), and all clients together get at most
 * {@code app.bill.daily-cap} per UTC day — per-IP limits alone are bypassed by
 * rotating addresses, which would otherwise drain the daily API quota.
 */
@Component
public class BillRateLimiter {

    private final CooldownRateLimiter perClient;
    private final DailyCap daily;

    public BillRateLimiter(long windowSeconds) {
        this(windowSeconds, 0);
    }

    @Autowired
    public BillRateLimiter(@Value("${app.bill.rate-limit.window-seconds:60}") long windowSeconds,
                           @Value("${app.bill.daily-cap:200}") int dailyCap) {
        this.perClient = new CooldownRateLimiter(windowSeconds);
        this.daily = new DailyCap(dailyCap);
    }

    /**
     * Checks the global daily cap and the client's cooldown; if both are clear, starts a
     * fresh window for the client and counts the call against today's cap.
     *
     * @param clientId stable per-client key (see ClientIpResolver)
     * @return 0 if the call is allowed; otherwise the whole number of seconds to wait.
     */
    public synchronized long acquire(String clientId) {
        long dailyWait = daily.peek();
        if (dailyWait > 0) return dailyWait;
        long wait = perClient.acquire(clientId);
        if (wait == 0) daily.consume();
        return wait;
    }
}
