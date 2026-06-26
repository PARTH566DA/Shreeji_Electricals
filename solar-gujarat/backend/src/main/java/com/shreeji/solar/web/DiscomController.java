package com.shreeji.solar.web;

import com.shreeji.solar.model.Discom;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "DISCOMs", description = "Gujarat distribution companies")
public class DiscomController {

    @Operation(summary = "List Gujarat DISCOMs with their service areas")
    @GetMapping("/discoms")
    public List<Map<String, String>> discoms() {
        return Arrays.stream(Discom.values())
                .map(d -> Map.of("code", d.getCode(), "name", d.getName(), "area", d.getArea()))
                .toList();
    }
}
