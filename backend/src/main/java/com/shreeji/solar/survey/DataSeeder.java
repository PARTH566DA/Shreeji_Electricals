package com.shreeji.solar.survey;

import com.shreeji.solar.model.Discom;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/** Seeds a couple of sample leads on the dev (H2) profile so the admin table isn't empty. */
@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private final LeadRepository repo;

    public DataSeeder(LeadRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        repo.save(lead("Rajesh Patel", "9876543210", "rajesh@example.com", "14 Sunfield Society, Alkapuri",
                "Vadodara", Discom.MGVCL, 2800.0, "RCC", LocalDate.now().plusDays(3),
                "Want to cover most of my bill.", LeadStatus.NEW));
        repo.save(lead("Nilamben Shah", "9988776655", "nilam@example.com", "7 Riverside Apartments, Adajan",
                "Surat", Discom.DGVCL, 3500.0, "Tiled", LocalDate.now().plusDays(5),
                "Interested in 3 kW with subsidy.", LeadStatus.CONTACTED));
        repo.save(lead("Hardik Mehta", "9090909090", null, "22 Greenview, Kalawad Road",
                "Rajkot", Discom.PGVCL, 4200.0, "Metal sheet", null,
                "Please call after 6 pm.", LeadStatus.SURVEYED));
    }

    private Lead lead(String name, String phone, String email, String address, String city,
                      Discom discom, Double bill, String roof, LocalDate date, String msg, LeadStatus status) {
        Lead l = new Lead();
        l.setName(name);
        l.setPhone(phone);
        l.setEmail(email);
        l.setAddress(address);
        l.setCity(city);
        l.setDiscom(discom);
        l.setMonthlyBill(bill);
        l.setRoofType(roof);
        l.setPreferredDate(date);
        l.setMessage(msg);
        l.setStatus(status);
        return l;
    }
}
