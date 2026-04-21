package com.itp.skilledworker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

public class EquipmentDtos {

    @Data
    public static class EquipmentCreateRequest {
        @NotNull(message = "Category is required")
        private Integer categoryId;

        @NotBlank(message = "Equipment name is required")
        private String equipmentName;

        private String equipmentDescription;

        @NotBlank(message = "Equipment condition is required")
        private String equipmentCondition = "good";

        @NotNull(message = "Rental price per day is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Rental price must be positive")
        private BigDecimal rentalPricePerDay;

        @NotNull(message = "Late fee per day is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Late fee per day cannot be negative")
        private BigDecimal lateFeePerDay;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantityTotal;
    }

    @Data
    public static class EquipmentUpdateRequest {
        private String equipmentName;
        private String equipmentDescription;
        private BigDecimal rentalPricePerDay;

        @DecimalMin(value = "0.0", inclusive = true, message = "Late fee per day cannot be negative")
        private BigDecimal lateFeePerDay;
    }

    @Data
    public static class EquipmentBookingRequest {
        @NotNull(message = "Equipment is required")
        private Integer equipmentId;

        @NotBlank(message = "Rental start date is required")
        private String rentalStartDate;

        @NotBlank(message = "Rental end date is required")
        private String rentalEndDate;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity = 1;

        private String notes;
        
    }
}

