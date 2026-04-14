package com.itp.skilledworker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class BookingDtos {

    @Data
    public static class BookingCreateRequest {
        // jobId is optional – customers can book a worker directly
        private Integer jobId;

        @NotNull(message = "Worker is required")
        private Integer workerId;

        @NotBlank(message = "Scheduled date is required")
        private String scheduledDate;

        @NotBlank(message = "Scheduled time is required")
        private String scheduledTime;

        private String notes;
    }

    @Data
    public static class BookingStatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status;

        private String reason;
    }

    @Data
    public static class BookingUpdateRequest {
        private String notes;
        private String scheduledDate;
        private String scheduledTime;
    }
}
