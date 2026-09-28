package com.shreeji.solar.survey;

import com.shreeji.solar.model.Discom;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SurveyRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String phone;

    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotNull(message = "DISCOM is required")
    private Discom discom;

    @Positive(message = "Monthly bill must be positive")
    private Double monthlyBill;

    @NotBlank(message = "Roof type is required")
    private String roofType;

    @FutureOrPresent(message = "Preferred date cannot be in the past")
    private LocalDate preferredDate;

    @Size(max = 1000, message = "Message is too long")
    private String message;
}
