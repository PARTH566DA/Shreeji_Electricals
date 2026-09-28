package com.shreeji.solar.bill;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Reads a bill image with Google Gemini's vision API (free-tier key from
 * https://aistudio.google.com/apikey). Unlike Tesseract it copes with
 * handwritten Gujarati and unclear phone photos, and returns structured JSON
 * directly (no regex parsing). Best-effort: returns null on any failure so
 * BillAnalysisService can fall back to local OCR. The image is sent to the
 * API for reading but never persisted by us.
 */
@Component
public class GeminiBillExtractor {

    private static final Logger log = LoggerFactory.getLogger(GeminiBillExtractor.class);

    /** Shape Gemini must return; enforced server-side via responseSchema. */
    private static final Map<String, Object> RESPONSE_SCHEMA = Map.of(
            "type", "OBJECT",
            "properties", Map.of(
                    "unitsConsumed", Map.of("type", "NUMBER", "nullable", true,
                            "description", "Electricity units (kWh) consumed in the billing period"),
                    "billAmount", Map.of("type", "NUMBER", "nullable", true,
                            "description", "Net/total amount payable in rupees"),
                    "discom", Map.of("type", "STRING", "nullable", true,
                            "enum", List.of("MGVCL", "DGVCL", "UGVCL", "PGVCL")),
                    "legible", Map.of("type", "BOOLEAN",
                            "description", "false when the image is too unclear to read any value")),
            "required", List.of("legible"));

    private static final String PROMPT = """
            Read this electricity bill from a Gujarat (India) DISCOM. It may be printed or \
            handwritten, in English or Gujarati script, and the photo may be blurry or skewed.
            Extract:
            - unitsConsumed: units (kWh) consumed this billing period. Gujarati labels: વપરાશ, યુનિટ.
            - billAmount: net/total amount payable in rupees. Gujarati labels: ચૂકવવાની રકમ, ભરવાની રકમ, કુલ રકમ.
            - discom: the issuing company — MGVCL (મધ્ય ગુજરાત), DGVCL (દક્ષિણ ગુજરાત), \
            UGVCL (ઉત્તર ગુજરાત) or PGVCL (પશ્ચિમ ગુજરાત).
            - legible: false if the image is too unclear to read any value.
            Use null for anything you cannot read confidently — never guess digits.""";

    private final RestClient rest;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String apiKey;
    private final String model;

    // Key comes from application-local.yml (git-ignored) in dev, or the GEMINI_API_KEY env var in prod.
    public GeminiBillExtractor(@Value("${app.gemini.api-key:${GEMINI_API_KEY:}}") String apiKey,
                               @Value("${app.gemini.model:gemini-2.5-flash}") String model) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(40)); // vision calls can take a few seconds
        this.rest = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .requestFactory(factory)
                .build();
    }

    /** True when a GEMINI_API_KEY is set — otherwise the caller uses local OCR. */
    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    /** Extracted fields; any of units/amount/discom may be null when unreadable. */
    public record Extraction(Double units, Double amount, String discom, boolean legible) {}

    /** Returns null when not configured or on any API/parse failure (caller falls back). */
    public Extraction extract(byte[] imageBytes, String mimeType) {
        if (!isConfigured()) return null;
        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(
                            Map.of("inlineData", Map.of(
                                    "mimeType", mimeType,
                                    "data", Base64.getEncoder().encodeToString(imageBytes))),
                            Map.of("text", PROMPT)))),
                    "generationConfig", Map.of(
                            "temperature", 0,
                            "responseMimeType", "application/json",
                            "responseSchema", RESPONSE_SCHEMA));

            String raw = rest.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode text = mapper.readTree(raw)
                    .path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (text.isMissingNode() || text.asText().isBlank()) {
                log.warn("Gemini returned no candidate text for bill extraction");
                return null;
            }
            JsonNode f = mapper.readTree(text.asText());
            return new Extraction(
                    f.hasNonNull("unitsConsumed") ? f.get("unitsConsumed").asDouble() : null,
                    f.hasNonNull("billAmount") ? f.get("billAmount").asDouble() : null,
                    f.hasNonNull("discom") ? f.get("discom").asText() : null,
                    f.path("legible").asBoolean(false));
        } catch (Exception e) {
            // Quota exhausted / network / bad key — degrade, never block the user.
            log.warn("Gemini bill extraction failed: {}", e.toString());
            return null;
        }
    }
}
