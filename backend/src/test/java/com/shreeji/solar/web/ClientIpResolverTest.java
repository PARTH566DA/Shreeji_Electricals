package com.shreeji.solar.web;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class ClientIpResolverTest {

    private static MockHttpServletRequest request(String remote, String xff) {
        MockHttpServletRequest r = new MockHttpServletRequest();
        r.setRemoteAddr(remote);
        if (xff != null) r.addHeader("X-Forwarded-For", xff);
        return r;
    }

    @Test
    void ignoresForwardedHeaderUnlessTrusted() {
        ClientIpResolver resolver = new ClientIpResolver(false, 1);
        assertEquals("10.0.0.5", resolver.resolve(request("10.0.0.5", "6.6.6.6")));
    }

    @Test
    void trustedProxyUsesRightmostEntryNotClientSuppliedOne() {
        ClientIpResolver resolver = new ClientIpResolver(true, 1);
        // Client forged "6.6.6.6"; the proxy appended the real address last.
        assertEquals("203.0.113.7", resolver.resolve(request("10.0.0.5", "6.6.6.6, 203.0.113.7")));
    }

    @Test
    void honoursConfiguredProxyCount() {
        ClientIpResolver resolver = new ClientIpResolver(true, 2);
        assertEquals("203.0.113.7", resolver.resolve(request("10.0.0.5", "6.6.6.6, 203.0.113.7, 10.1.1.1")));
    }

    @Test
    void ipv6ClientsShareTheirSlash64() {
        assertEquals(ClientIpResolver.normalize("2001:db8:1:2::1"), ClientIpResolver.normalize("2001:db8:1:2:ffff::9"));
        assertNotEquals(ClientIpResolver.normalize("2001:db8:1:2::1"), ClientIpResolver.normalize("2001:db8:1:3::1"));
    }

    @Test
    void rejectsNonLiteralsWithoutDnsLookup() {
        assertEquals("invalid", ClientIpResolver.normalize("example.com"));
        assertEquals("invalid", ClientIpResolver.normalize("cafe"));
        assertEquals("invalid", ClientIpResolver.normalize("999.1.1.1"));
    }
}
