package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.dto.ReviewComplaintDtos.ComplaintCreateRequest;
import com.itp.skilledworker.dto.ReviewComplaintDtos.ComplaintStatusUpdateRequest;
import com.itp.skilledworker.dto.ReviewComplaintDtos.MessageCreateRequest;
import com.itp.skilledworker.dto.ReviewComplaintDtos.MessageThreadCreateRequest;
import com.itp.skilledworker.dto.ReviewComplaintDtos.PendingReviewResponse;
import com.itp.skilledworker.dto.ReviewComplaintDtos.ReviewCreateRequest;
import com.itp.skilledworker.dto.ReviewComplaintDtos.ReviewUpdateRequest;
import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.UserRepository;
import com.itp.skilledworker.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    // --------- REVIEWS ---------
    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<Review>> submitReview(@Valid @RequestBody ReviewCreateRequest body,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            Review review = reviewService.submitReview(
                    body.getBookingId(),
                    userId,
                    body.getRevieweeId(),
                    body.getRating(),
                    body.getReviewText(),
                    body.getReviewerType());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Review submitted", review));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/reviews/worker/{workerUserId}")
    public ResponseEntity<ApiResponse<List<Review>>> getWorkerReviews(@PathVariable Integer workerUserId) {
        return ResponseEntity.ok(ApiResponse.ok("Reviews", reviewService.getReviewsForWorker(workerUserId)));
    }

    @GetMapping("/reviews/customer/{customerUserId}")
    public ResponseEntity<ApiResponse<List<Review>>> getCustomerReviews(@PathVariable Integer customerUserId) {
        return ResponseEntity.ok(ApiResponse.ok("Reviews", reviewService.getReviewsForCustomer(customerUserId)));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<Review>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.ok("All reviews", reviewService.getAllReviews()));
    }

    @GetMapping("/reviews/my")
    public ResponseEntity<ApiResponse<List<Review>>> getMyReviews(Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            return ResponseEntity.ok(ApiResponse.ok("My reviews", reviewService.getMyReviews(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/reviews/pending")
    public ResponseEntity<ApiResponse<List<PendingReviewResponse>>> getPendingReviews(Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            return ResponseEntity.ok(ApiResponse.ok("Pending reviews", reviewService.getPendingReviews(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/reviews/pending/job/{jobId}")
    public ResponseEntity<ApiResponse<List<PendingReviewResponse>>> getPendingReviewsForJob(
            @PathVariable Integer jobId,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            return ResponseEntity.ok(ApiResponse.ok("Pending reviews for job",
                    reviewService.getPendingReviewsForJob(userId, jobId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // --------- COMPLAINTS ---------
    @PostMapping("/complaints")
    public ResponseEntity<ApiResponse<Complaint>> submitComplaint(@Valid @RequestBody ComplaintCreateRequest body,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            Complaint complaint = reviewService.submitComplaint(
                    userId,
                    body.getComplaintCategory(),
                    body.getComplaintTitle(),
                    body.getComplaintDescription(),
                    body.getBookingId(),
                    body.getComplainedAgainstUserId(),
                    body.getReviewId());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Complaint submitted", complaint));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<Complaint>>> getAllComplaints(Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            return ResponseEntity.ok(ApiResponse.ok("Complaints", reviewService.getAllComplaints(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/complaints/my")
    public ResponseEntity<ApiResponse<List<Complaint>>> getMyComplaints(Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            return ResponseEntity.ok(ApiResponse.ok("My complaints", reviewService.getMyComplaints(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<Complaint>> updateComplaintStatus(@PathVariable Integer id,
            @Valid @RequestBody ComplaintStatusUpdateRequest body,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            Complaint complaint = reviewService.updateComplaintStatus(id, userId, body.getStatus());
            return ResponseEntity.ok(ApiResponse.ok("Complaint updated", complaint));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // NOTE: Messaging endpoints moved to dedicated MessageController

    @PutMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<Review>> updateReview(@PathVariable Integer id,
            @Valid @RequestBody ReviewUpdateRequest body, Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            Review review = reviewService.updateReview(
                    id, userId,
                    body.getRating(),
                    body.getReviewText());
            return ResponseEntity.ok(ApiResponse.ok("Review updated", review));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<?>> deleteReview(@PathVariable Integer id, Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            reviewService.deleteReview(id, userId);
            return ResponseEntity.ok(ApiResponse.ok("Review deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<?>> deleteComplaint(@PathVariable Integer id, Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            reviewService.deleteComplaint(id, userId);
            return ResponseEntity.ok(ApiResponse.ok("Complaint deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private Integer getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getUserId();
    }
}
