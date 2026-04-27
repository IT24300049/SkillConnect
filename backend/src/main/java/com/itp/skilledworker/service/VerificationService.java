package com.itp.skilledworker.service;

import com.itp.skilledworker.dto.VerificationDtos;
import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.entity.WorkerProfile;
import com.itp.skilledworker.entity.WorkerVerification;
import com.itp.skilledworker.repository.UserRepository;
import com.itp.skilledworker.repository.WorkerProfileRepository;
import com.itp.skilledworker.repository.WorkerVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationService {
    // Manages worker document verification lifecycle (submit, review, approve/reject).

    private final WorkerVerificationRepository verificationRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;

    @Value("${upload.verification-dir:uploads/verification}")
    private String uploadDir;

    private static final long MAX_FILE_BYTES = 5L * 1024 * 1024; // 5 MB

    @Transactional
    public VerificationDtos.WorkerVerificationResponse submitForCurrentWorker(String email,
                                                                              String documentType,
                                                                              MultipartFile front,
                                                                              MultipartFile back) throws IOException {
        if (front == null || back == null || front.isEmpty() || back.isEmpty()) {
            throw new RuntimeException("Both front and back images are required.");
        }
        validateImage(front);
        validateImage(back);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WorkerProfile worker = workerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

        Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(baseDir);

        String docTypeUpper = documentType != null ? documentType.toUpperCase() : "NIC";
        WorkerVerification.DocumentType docType = WorkerVerification.DocumentType.valueOf(docTypeUpper);

        String frontFilename = saveFile(baseDir, worker.getWorkerId(), "front", front);
        String backFilename = saveFile(baseDir, worker.getWorkerId(), "back", back);

        WorkerVerification verification = verificationRepository.findByWorker_WorkerId(worker.getWorkerId())
                .orElseGet(WorkerVerification::new);

        verification.setWorker(worker);
        verification.setDocumentType(docType);
        verification.setFrontImageUrl(frontFilename);
        verification.setBackImageUrl(backFilename);
        verification.setStatus(WorkerVerification.Status.SUBMITTED);
        verification.setRejectionReason(null);
        verification.setSubmittedAt(LocalDateTime.now());
        verification.setReviewedAt(null);
        verification.setReviewedByAdmin(null);

        verification = verificationRepository.save(verification);

        // Re-submission resets worker verified state until an admin reviews again.
        worker.setIsVerified(false);
        worker.setVerificationDate(null);
        workerProfileRepository.save(worker);

        return VerificationDtos.fromEntity(verification);
    }

    @Transactional(readOnly = true)
    public VerificationDtos.WorkerVerificationResponse getForCurrentWorker(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WorkerProfile worker = workerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

        return verificationRepository.findByWorker_WorkerId(worker.getWorkerId())
                .map(VerificationDtos::fromEntity)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<WorkerVerification> getByStatus(WorkerVerification.Status status) {
        if (status == null) {
            return verificationRepository.findAll();
        }
        return verificationRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<VerificationDtos.AdminVerificationSummary> getAdminSummaries(WorkerVerification.Status status) {
        List<WorkerVerification> list = getByStatus(status);
        return list.stream()
                .map(VerificationDtos::toAdminSummary)
                .toList();
    }

    @Transactional
    public VerificationDtos.WorkerVerificationResponse adminUpdateStatus(Integer workerId,
                                                                          WorkerVerification.Status status,
                                                                          String rejectionReason,
                                                                          String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        if (admin.getRole() != User.Role.admin) {
            throw new RuntimeException("Only admins can update verification status");
        }

        WorkerVerification verification = verificationRepository.findByWorker_WorkerId(workerId)
                .orElseThrow(() -> new RuntimeException("Verification record not found for worker"));

        verification.setStatus(status);
        verification.setReviewedAt(LocalDateTime.now());
        verification.setReviewedByAdmin(admin);
        if (status == WorkerVerification.Status.REJECTED) {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new RuntimeException("Rejection reason is required when rejecting a worker");
            }
            verification.setRejectionReason(rejectionReason);
        } else {
            verification.setRejectionReason(null);
        }

        WorkerProfile worker = verification.getWorker();
        // Verification decision directly controls worker verification flags.
        if (status == WorkerVerification.Status.APPROVED) {
            worker.setIsVerified(true);
            worker.setVerificationDate(LocalDateTime.now());
        } else if (status == WorkerVerification.Status.REJECTED) {
            worker.setIsVerified(false);
            worker.setVerificationDate(null);
        }
        workerProfileRepository.save(worker);

        verification = verificationRepository.save(verification);
        return VerificationDtos.fromEntity(verification);
    }

    private void validateImage(MultipartFile file) {
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new RuntimeException("File size must be 5MB or less");
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equalsIgnoreCase("image/jpeg")
                && !contentType.equalsIgnoreCase("image/png"))) {
            throw new RuntimeException("Only JPEG and PNG images are allowed");
        }
    }

    private String saveFile(Path baseDir, Integer workerId, String side, MultipartFile file) throws IOException {
        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String filename = "worker-" + workerId + "-" + side + "-" + UUID.randomUUID() + ext;
        Path target = baseDir.resolve(filename).normalize();
        Files.copy(file.getInputStream(), target);
        return "/uploads/verification/" + filename;
    }
}
