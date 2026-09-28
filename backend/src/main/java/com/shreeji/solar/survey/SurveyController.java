package com.shreeji.solar.survey;

import com.shreeji.solar.model.Discom;
import com.shreeji.solar.web.ClientIpResolver;
import com.shreeji.solar.web.CooldownRateLimiter;
import com.shreeji.solar.web.DailyCap;
import com.shreeji.solar.web.TooManyRequestsException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Survey & Leads", description = "Capture survey bookings; list leads (admin)")
public class SurveyController {

    private final LeadRepository repo;
    private final ClientIpResolver clientIp;
    // Public, unauthenticated write — bound it so bots can't flood the leads table.
    private final CooldownRateLimiter perClient;
    private final DailyCap daily;

    public SurveyController(LeadRepository repo, ClientIpResolver clientIp,
                            @Value("${app.survey.rate-limit.window-seconds:60}") long windowSeconds,
                            @Value("${app.survey.daily-cap:100}") int dailyCap) {
        this.repo = repo;
        this.clientIp = clientIp;
        this.perClient = new CooldownRateLimiter(windowSeconds);
        this.daily = new DailyCap(dailyCap);
    }

    @Operation(summary = "Book a survey (creates a Lead)")
    @PostMapping("/survey")
    public ResponseEntity<Map<String, Object>> book(@Valid @RequestBody SurveyRequest req, HttpServletRequest request) {
        synchronized (this) {
            long wait = daily.peek();
            if (wait == 0) wait = perClient.acquire(clientIp.resolve(request));
            if (wait > 0) {
                throw new TooManyRequestsException(wait, "Too many survey requests. Please try again later.");
            }
            daily.consume();
        }
        Lead lead = new Lead();
        lead.setName(req.getName());
        lead.setPhone(req.getPhone());
        lead.setEmail(req.getEmail());
        lead.setAddress(req.getAddress());
        lead.setCity(req.getCity());
        lead.setDiscom(req.getDiscom());
        lead.setMonthlyBill(req.getMonthlyBill());
        lead.setRoofType(req.getRoofType());
        lead.setPreferredDate(req.getPreferredDate());
        lead.setMessage(req.getMessage());
        lead.setStatus(LeadStatus.NEW);
        Lead saved = repo.save(lead);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId(),
                "message", "Survey booked. We'll call within 48 hours."
        ));
    }

    @Operation(summary = "List captured leads (admin only — HTTP Basic auth)",
            security = @SecurityRequirement(name = "basicAuth"))
    @GetMapping("/leads")
    public List<Lead> leads() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    @Operation(summary = "Gujarat DISCOM options (for forms)")
    @GetMapping("/survey/roof-types")
    public List<String> roofTypes() {
        return List.of("RCC", "Metal sheet", "Tiled", "Other");
    }

    // exposed for completeness; Discom values also at /api/discoms
    @GetMapping("/survey/discoms")
    public Discom[] discomEnum() {
        return Discom.values();
    }
}
