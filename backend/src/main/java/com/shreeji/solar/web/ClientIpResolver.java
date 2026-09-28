package com.shreeji.solar.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.Inet6Address;
import java.net.InetAddress;
import java.util.regex.Pattern;

/**
 * Stable per-client key for rate limiting.
 *
 * <p>{@code X-Forwarded-For} is only honoured when {@code app.trust-forwarded-headers=true},
 * and even then we take the entry our own proxies appended — counted from the RIGHT —
 * because anything to the left is supplied by the client and trivially spoofed.
 * IPv6 clients are keyed by their /64, since one subscriber typically owns a whole /64.
 */
@Component
public class ClientIpResolver {

    private static final Pattern IPV4 = Pattern.compile("\\d{1,3}(\\.\\d{1,3}){3}");
    private static final Pattern IPV6_CHARS = Pattern.compile("[0-9A-Fa-f:.]+");

    private final boolean trustForwardedHeaders;
    private final int trustedProxyCount;

    public ClientIpResolver(@Value("${app.trust-forwarded-headers:false}") boolean trustForwardedHeaders,
                            @Value("${app.trusted-proxy-count:1}") int trustedProxyCount) {
        this.trustForwardedHeaders = trustForwardedHeaders;
        this.trustedProxyCount = Math.max(1, trustedProxyCount);
    }

    public String resolve(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String forwarded = request.getHeader("X-Forwarded-For");
        if (trustForwardedHeaders && forwarded != null && !forwarded.isBlank()) {
            String[] hops = forwarded.split(",");
            // With N trusted proxies, the N-th entry from the right is the real client.
            String candidate = hops[Math.max(0, hops.length - trustedProxyCount)].trim();
            if (!candidate.isEmpty()) ip = candidate;
        }
        return normalize(ip);
    }

    static String normalize(String ip) {
        if (ip == null || ip.isBlank()) return "unknown";
        if (IPV4.matcher(ip).matches()) {
            for (String octet : ip.split("\\.")) {
                if (Integer.parseInt(octet) > 255) return "invalid";
            }
            return ip;
        }
        String v6 = ip.startsWith("[") && ip.endsWith("]") ? ip.substring(1, ip.length() - 1) : ip;
        // A colon guarantees InetAddress parses a literal — never a DNS lookup on header input.
        if (!v6.contains(":") || !IPV6_CHARS.matcher(v6).matches()) return "invalid";
        try {
            InetAddress addr = InetAddress.getByName(v6);
            if (addr instanceof Inet6Address) {
                byte[] b = addr.getAddress();
                StringBuilder sb = new StringBuilder("v6:");
                for (int i = 0; i < 8; i++) sb.append(String.format("%02x", b[i]));
                return sb.append("/64").toString();
            }
            return addr.getHostAddress();
        } catch (Exception e) {
            return "invalid";
        }
    }
}
