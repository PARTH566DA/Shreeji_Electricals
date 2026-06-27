package com.shreeji.solar.survey;

import com.shreeji.solar.model.Discom;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "leads")
@Getter
@Setter
@NoArgsConstructor
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private String email;

    @Column(length = 500)
    private String address;
    private String city;

    @Enumerated(EnumType.STRING)
    private Discom discom;

    private Double monthlyBill;
    private String roofType;
    private LocalDate preferredDate;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    private LeadStatus status = LeadStatus.NEW;

    private Instant createdAt = Instant.now();

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = LeadStatus.NEW;
    }
}
