package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.dto.WorkerDtos.WorkerProfileUpdateRequest;
import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.UserRepository;
import com.itp.skilledworker.service.UserService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkerProfile>>> getAllWorkers(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean available) {
        return ResponseEntity.ok(ApiResponse.ok("Workers", userService.getAllWorkers(district, category)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkerProfile>> getWorker(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Worker profile", userService.getWorkerById(id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<WorkerProfile>> getMyProfile(Authentication auth) {
        try {
            WorkerProfile profile = userService.getWorkerByEmail(auth.getName());
            return ResponseEntity.ok(ApiResponse.ok("Worker profile", profile));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<WorkerProfile>> updateMyProfile(
            @Valid @RequestBody WorkerProfileUpdateRequest body,
            Authentication auth) {
        try {
            WorkerProfile profile = userService.updateWorkerProfile(auth.getName(), body);
            return ResponseEntity.ok(ApiResponse.ok("Profile updated", profile));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<?>> deleteMyAccount(Authentication auth) {
        try {
            userService.deactivateUser(auth.getName());
            return ResponseEntity.ok(ApiResponse.ok("Account deactivated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<List<WorkerAvailability>>> getWorkerAvailability(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("Worker availability", userService.getWorkerAvailability(id)));
    }

    @PostMapping("/me/availability")
    public ResponseEntity<ApiResponse<WorkerAvailability>> addMyAvailability(
            @RequestBody AvailabilityRequest req, Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Availability added",
                    userService.addAvailability(auth.getName(), req.getDate(), req.getStartTime(), req.getEndTime(),
                            req.getNote())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/me/availability/{availabilityId}")
    public ResponseEntity<ApiResponse<?>> deleteMyAvailability(@PathVariable Long availabilityId, Authentication auth) {
        try {
            userService.deleteAvailability(auth.getName(), availabilityId);
            return ResponseEntity.ok(ApiResponse.ok("Availability deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/me/availability/bulk")
    public ResponseEntity<ApiResponse<List<WorkerAvailability>>> upsertMyAvailabilityBulk(
            @RequestBody BulkAvailabilityRequest req,
            Authentication auth) {
        try {
            List<WorkerAvailability> slots = req.getSlots().stream().map(s -> {
                WorkerAvailability a = new WorkerAvailability();
                a.setStartTime(s.getStartTime());
                a.setEndTime(s.getEndTime());
                a.setIsAvailable(s.getIsAvailable());
                a.setNote(s.getNote());
                return a;
            }).toList();

            return ResponseEntity.ok(ApiResponse.ok(
                    "Availability slots updated",
                    userService.upsertAvailabilitySlots(auth.getName(), req.getDate(), slots)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Admin: Get all users
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        // Central list used by admin user-management UI.
        return ResponseEntity.ok(ApiResponse.ok("All users", userService.getAllUsers()));
    }

    // Admin: Toggle user active status
    @PatchMapping("/admin/users/{userId}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> toggleUser(@PathVariable Integer userId) {
        try {
            // Soft toggle: keeps user data/history, only flips active flag.
            User user = userService.toggleUserActive(userId);
            return ResponseEntity.ok(ApiResponse.ok("User status updated", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Admin: Update user role
    @PatchMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUserRole(@PathVariable Integer id,
            @Valid @RequestBody RoleUpdateRequest body) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            // Role comes as text from UI and is mapped to enum for safe persistence.
            user.setRole(User.Role.valueOf(body.getRole().toLowerCase()));
            user = userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.ok("User role updated", user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid role: " + body.getRole()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Data
    static class RoleUpdateRequest {
        private String role;
    }

    @Data
    static class AvailabilityRequest {
        private java.time.LocalDate date;
        private java.time.LocalTime startTime;
        private java.time.LocalTime endTime;
        private String note;
    }

    @Data
    static class BulkAvailabilityRequest {
        private java.time.LocalDate date;
        private List<SlotRequest> slots;
    }

    @Data
    static class SlotRequest {
        private java.time.LocalTime startTime;
        private java.time.LocalTime endTime;
        private Boolean isAvailable;
        private String note;
    }
}
