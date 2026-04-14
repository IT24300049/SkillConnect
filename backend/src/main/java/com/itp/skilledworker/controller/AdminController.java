package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.entity.Job;
import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.repository.BookingRepository;
import com.itp.skilledworker.repository.JobRepository;
import com.itp.skilledworker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // User counts
        stats.put("totalUsers", userRepository.count());
        stats.put("customerCount",
                userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.customer).count());
        stats.put("workerCount",
                userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.worker).count());
        stats.put("supplierCount",
                userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.supplier).count());

        // Job counts
        stats.put("totalJobs", jobRepository.count());
        stats.put("activeJobs",
                jobRepository.findAll().stream().filter(j -> j.getJobStatus() == Job.JobStatus.active).count());
        stats.put("completedJobs",
                jobRepository.findAll().stream().filter(j -> j.getJobStatus() == Job.JobStatus.completed).count());

        // Booking counts
        stats.put("totalBookings", bookingRepository.count());

        return ResponseEntity.ok(ApiResponse.ok("Admin stats", stats));
    }
}
