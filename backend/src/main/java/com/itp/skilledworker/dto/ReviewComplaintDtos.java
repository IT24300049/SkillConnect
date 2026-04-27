package com.itp.skilledworker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class ReviewComplaintDtos {

    @Data
    public static class ReviewCreateRequest {
        @NotNull(message = "Booking is required")
        private Integer bookingId;

        @NotNull(message = "Reviewee is required")
        private Integer revieweeId;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating cannot be more than 5")
        private Integer rating;

        private String reviewText;

        @NotBlank(message = "Reviewer type is required")
        private String reviewerType;
    }

    @Data
    public static class ReviewUpdateRequest {
        private Integer rating;
        private String reviewText;
    }

    @Data
    public static class ComplaintCreateRequest {
        @NotBlank(message = "Complaint category is required")
        private String complaintCategory;

        @NotBlank(message = "Complaint title is required")
        private String complaintTitle;

        @NotBlank(message = "Complaint description is required")
        private String complaintDescription;

        private Integer bookingId;

        @NotNull(message = "Please select who the complaint is against")
        private Integer complainedAgainstUserId;

        private Integer reviewId;
    }

    @Data
    public static class ComplaintStatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status;
    }

    @Data
    public static class MessageThreadCreateRequest {
        @NotNull(message = "Other user is required")
        private Integer otherUserId;

        private Integer bookingId;
    }

    @Data
    public static class MessageCreateRequest {
        @NotNull(message = "Thread is required")
        private Integer threadId;

        @NotBlank(message = "Message text is required")
        private String messageText;
    }

    @Data
    public static class PendingReviewResponse {
        private Integer bookingId;
        private Integer jobId;
        private String jobTitle;
        private Integer revieweeUserId;
        private String revieweeName;
        private String revieweeEmail;
        private String reviewerType;
        private String completedAt;
        private String reviewDeadline;
        private Integer workerUserId;
        private Integer customerUserId;
    }
}

