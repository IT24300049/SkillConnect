package com.itp.skilledworker.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

public class JobDtos {

    @Data
    public static class JobCreateRequest {
        @NotNull(message = "Category is required")
        private Integer categoryId;

        @NotBlank(message = "Job title is required")
        private String jobTitle;

        @NotBlank(message = "Job description is required")
        private String jobDescription;

        private String city;
        private String district;

        @NotBlank(message = "Urgency level is required")
        private String urgencyLevel = "standard";

        @DecimalMin(value = "0.0", inclusive = false, message = "Minimum budget must be positive")
        private BigDecimal budgetMin;

        @DecimalMin(value = "0.0", inclusive = false, message = "Maximum budget must be positive")
        private BigDecimal budgetMax;

        // ISO date (yyyy-MM-dd) as string; parsed in service
        private String preferredStartDate;
    }

    @Data
    public static class JobUpdateRequest {
        private String jobTitle;
        private String jobDescription;
        private BigDecimal budgetMin;
        private BigDecimal budgetMax;
        private String urgencyLevel;
    }
}

