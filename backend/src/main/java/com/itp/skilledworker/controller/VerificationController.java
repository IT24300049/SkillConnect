package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.dto.VerificationDtos;
import com.itp.skilledworker.entity.WorkerVerification;
import com.itp.skilledworker.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping("/workers/me/verification")
    public ResponseEntity<ApiResponse<VerificationDtos.WorkerVerificationResponse>> submitMyVerification(
            @RequestParam("documentType") String documentType,
            @RequestParam("frontImage") MultipartFile front,
            @RequestParam("backImage") MultipartFile back,
            Authentication auth) {
        try {
            var dto = verificationService.submitForCurrentWorker(auth.getName(), documentType, front, back);
            return ResponseEntity.ok(ApiResponse.ok("Verification submitted", dto));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to save files: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/workers/me/verification")
    public ResponseEntity<ApiResponse<VerificationDtos.WorkerVerificationResponse>> getMyVerification(Authentication auth) {
        try {
            var dto = verificationService.getForCurrentWorker(auth.getName());
            return ResponseEntity.ok(ApiResponse.ok("Verification", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/admin/verifications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<VerificationDtos.AdminVerificationSummary>>> listVerifications(
            @RequestParam(required = false) WorkerVerification.Status status) {
        return ResponseEntity.ok(ApiResponse.ok("Verifications", verificationService.getAdminSummaries(status)));
    }

    @PatchMapping("/admin/verifications/{workerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VerificationDtos.WorkerVerificationResponse>> updateStatus(
            @PathVariable Integer workerId,
            @RequestBody AdminUpdateRequest body,
            Authentication auth) {
        try {
            WorkerVerification.Status status = WorkerVerification.Status.valueOf(body.status());
            var dto = verificationService.adminUpdateStatus(workerId, status, body.rejectionReason(), auth.getName());
            return ResponseEntity.ok(ApiResponse.ok("Verification updated", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    public record AdminUpdateRequest(String status, String rejectionReason) { }
}
