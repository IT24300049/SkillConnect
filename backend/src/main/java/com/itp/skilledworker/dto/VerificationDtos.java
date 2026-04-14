package com.itp.skilledworker.dto;

import com.itp.skilledworker.entity.WorkerVerification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

public class VerificationDtos {

    @Data
    @Builder
    public static class WorkerVerificationResponse {
        private String documentType;
        private String status;
        private String frontImageUrl;
        private String backImageUrl;
        private String rejectionReason;
        private LocalDateTime submittedAt;
        private LocalDateTime reviewedAt;
    }

    public static WorkerVerificationResponse fromEntity(WorkerVerification v) {
        if (v == null) return null;
        return WorkerVerificationResponse.builder()
                .documentType(v.getDocumentType() != null ? v.getDocumentType().name() : null)
                .status(v.getStatus() != null ? v.getStatus().name() : null)
                .frontImageUrl(v.getFrontImageUrl())
                .backImageUrl(v.getBackImageUrl())
                .rejectionReason(v.getRejectionReason())
                .submittedAt(v.getSubmittedAt())
                .reviewedAt(v.getReviewedAt())
                .build();
    }

    @Data
    @Builder
    public static class AdminVerificationSummary {
        private Long id;
        private Integer workerId;
        private String workerEmail;
        private String workerName;
        private String documentType;
        private String status;
        private String frontImageUrl;
        private String backImageUrl;
        private String rejectionReason;
        private LocalDateTime submittedAt;
        private LocalDateTime reviewedAt;
    }

    public static AdminVerificationSummary toAdminSummary(WorkerVerification v) {
        if (v == null) return null;
        String email = null;
        String fullName = null;
        if (v.getWorker() != null) {
            if (v.getWorker().getUser() != null) {
                email = v.getWorker().getUser().getEmail();
            }
            String first = v.getWorker().getFirstName() != null ? v.getWorker().getFirstName() : "";
            String last = v.getWorker().getLastName() != null ? v.getWorker().getLastName() : "";
            fullName = (first + " " + last).trim();
        }

        return AdminVerificationSummary.builder()
                .id(v.getId())
                .workerId(v.getWorker() != null ? v.getWorker().getWorkerId() : null)
                .workerEmail(email)
                .workerName(fullName)
                .documentType(v.getDocumentType() != null ? v.getDocumentType().name() : null)
                .status(v.getStatus() != null ? v.getStatus().name() : null)
                .frontImageUrl(v.getFrontImageUrl())
                .backImageUrl(v.getBackImageUrl())
                .rejectionReason(v.getRejectionReason())
                .submittedAt(v.getSubmittedAt())
                .reviewedAt(v.getReviewedAt())
                .build();
    }
}
