package com.shreeji.solar.bill;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BillRateLimiterTest {

    @Test
    void firstCallAllowedSecondWithinWindowRejected() {
        BillRateLimiter limiter = new BillRateLimiter(60);
        assertEquals(0, limiter.acquire("1.2.3.4"), "first call should be allowed");
        long wait = limiter.acquire("1.2.3.4");
        assertTrue(wait > 0 && wait <= 60, "second call within the window should be told to wait");
    }

    @Test
    void differentClientsAreIndependent() {
        BillRateLimiter limiter = new BillRateLimiter(60);
        assertEquals(0, limiter.acquire("1.1.1.1"));
        assertEquals(0, limiter.acquire("2.2.2.2"), "a different IP has its own window");
    }

    @Test
    void windowElapsesAndAllowsAgain() throws InterruptedException {
        BillRateLimiter limiter = new BillRateLimiter(1); // 1-second window
        assertEquals(0, limiter.acquire("9.9.9.9"));
        assertTrue(limiter.acquire("9.9.9.9") > 0);
        Thread.sleep(1100);
        assertEquals(0, limiter.acquire("9.9.9.9"), "after the window elapses the client is allowed again");
    }

    @Test
    void dailyCapStopsRotatingClients() {
        BillRateLimiter limiter = new BillRateLimiter(60, 2);
        assertEquals(0, limiter.acquire("1.1.1.1"));
        assertEquals(0, limiter.acquire("2.2.2.2"));
        assertTrue(limiter.acquire("3.3.3.3") > 0, "a fresh IP is still refused once today's cap is used");
    }

    @Test
    void rejectedCallsDoNotConsumeDailyCap() {
        BillRateLimiter limiter = new BillRateLimiter(60, 2);
        assertEquals(0, limiter.acquire("1.1.1.1"));
        assertTrue(limiter.acquire("1.1.1.1") > 0);
        assertEquals(0, limiter.acquire("2.2.2.2"), "the cooled-down retry must not have used a slot");
    }

    @Test
    void zeroWindowDisablesLimiter() {
        BillRateLimiter limiter = new BillRateLimiter(0);
        assertEquals(0, limiter.acquire("5.5.5.5"));
        assertEquals(0, limiter.acquire("5.5.5.5"), "window of 0 disables the limiter");
    }
}
