package com.shreeji.solar.calculator;

import com.shreeji.solar.model.Discom;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class EstimateRequest {

    public enum InputType { bill, units }

    @NotNull(message = "inputType is required")
    private InputType inputType;

    /** Required when inputType = bill. */
    @Positive(message = "monthlyBill must be positive")
    private Double monthlyBill;

    /** Required when inputType = units. */
    @Positive(message = "monthlyUnits must be positive")
    private Double monthlyUnits;

    @NotNull(message = "discom is required")
    private Discom discom;

    @Positive(message = "roofAreaSqft must be positive")
    private Double roofAreaSqft;

    @Positive(message = "sanctionedLoadKw must be positive")
    private Double sanctionedLoadKw;
}
