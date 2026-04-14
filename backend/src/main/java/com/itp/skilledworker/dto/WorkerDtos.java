package com.itp.skilledworker.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

public class WorkerDtos {

    @Data
    public static class WorkerProfileUpdateRequest {
        private String firstName;
        private String lastName;
        private String bio;
        private String city;
        private String district;

        private String skillCategory;

        @DecimalMin(value = "0.0", inclusive = false, message = "Minimum hourly rate must be positive")
        private BigDecimal hourlyRateMin;

        @DecimalMin(value = "0.0", inclusive = false, message = "Maximum hourly rate must be positive")
        private BigDecimal hourlyRateMax;
    }
}

