package com.shreeji.solar.calculator;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calculator")
@Tag(name = "Calculator", description = "Cost & subsidy estimation for PM Surya Ghar rooftop solar")
public class CalculatorController {

    private final CalculatorService service;

    public CalculatorController(CalculatorService service) {
        this.service = service;
    }

    @Operation(summary = "Estimate system size, subsidy, cost, savings and payback")
    @PostMapping("/estimate")
    public EstimateResponse estimate(@Valid @RequestBody EstimateRequest request) {
        return service.estimate(request);
    }
}
