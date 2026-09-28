package com.shreeji.solar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// No user accounts: skip Spring Security's auto-generated default user/password.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class SolarApplication {

    public static void main(String[] args) {
        SpringApplication.run(SolarApplication.class, args);
    }
}
