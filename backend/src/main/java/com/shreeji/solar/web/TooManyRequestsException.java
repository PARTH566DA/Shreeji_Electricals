package com.shreeji.solar.web;

/** Thrown when a client exceeds a rate limit; mapped to HTTP 429 by {@link ApiExceptionHandler}. */
public class TooManyRequestsException extends RuntimeException {

    private final long retryAfterSeconds;

    public TooManyRequestsException(long retryAfterSeconds, String message) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
