package com.shreeji.solar.survey;

import com.shreeji.solar.model.Discom;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    private final String adminToken;

    public SurveyController(LeadRepository repo, @Value("${app.admin.token}") String adminToken) {
        this.repo = repo;
        this.adminToken = adminToken;
    }

    @Operation(summary = "Book a survey (creates a Lead)")
    @PostMapping("/survey")
    public ResponseEntity<Map<String, Object>> book(@Valid @RequestBody SurveyRequest req) {
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

    @Operation(summary = "List captured leads (admin) — requires X-Admin-Token header")
    @GetMapping("/leads")
    public ResponseEntity<?> leads(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (token == null || !token.equals(adminToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "unauthorized", "message", "Valid X-Admin-Token required"));
        }
        List<Lead> leads = repo.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(leads);
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
