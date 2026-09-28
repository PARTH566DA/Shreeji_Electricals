package com.shreeji.solar;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Test
    void removedLeadAndConsoleEndpointsAreGone() throws Exception {
        mvc.perform(get("/api/leads")).andExpect(status().isNotFound());
        mvc.perform(post("/api/survey").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/h2-console")).andExpect(status().isNotFound());
    }

    @Test
    void unknownPathsAre404NotServerErrors() throws Exception {
        mvc.perform(get("/api/does-not-exist")).andExpect(status().isNotFound());
    }

    @Test
    void malformedJsonIs400() throws Exception {
        mvc.perform(post("/api/calculator/estimate").contentType(MediaType.APPLICATION_JSON).content("{nope"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void securityHeadersPresent() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().doesNotExist("Set-Cookie"));
    }

    @Test
    void corsRejectsUnknownOrigins() throws Exception {
        mvc.perform(options("/api/calculator/estimate")
                        .header("Origin", "https://evil.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
        mvc.perform(options("/api/calculator/estimate")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist("Access-Control-Allow-Credentials"));
    }

    @Test
    void forgedForwardedForCannotResetTheUploadCooldown() throws Exception {
        java.io.ByteArrayOutputStream png = new java.io.ByteArrayOutputStream();
        javax.imageio.ImageIO.write(new java.awt.image.BufferedImage(20, 20,
                java.awt.image.BufferedImage.TYPE_INT_RGB), "png", png);
        var file = new org.springframework.mock.web.MockMultipartFile("file", "b.png", "image/png", png.toByteArray());
        mvc.perform(multipart("/api/bill/analyze").file(file)
                        .with(r -> { r.setRemoteAddr("198.51.100.9"); return r; })
                        .header("X-Forwarded-For", "1.1.1.1"))
                .andExpect(status().isOk());
        mvc.perform(multipart("/api/bill/analyze").file(file)
                        .with(r -> { r.setRemoteAddr("198.51.100.9"); return r; })
                        .header("X-Forwarded-For", "2.2.2.2"))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void nonImageUploadRejectedEvenWithImageContentType() throws Exception {
        mvc.perform(multipart("/api/bill/analyze")
                        .file(new org.springframework.mock.web.MockMultipartFile(
                                "file", "x.png", "image/png", "<svg onload=alert(1)>".getBytes())))
                .andExpect(status().isBadRequest());
    }
}
