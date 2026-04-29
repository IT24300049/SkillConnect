package com.itp.skilledworker.service;

import com.itp.skilledworker.dto.WorkerDtos.WorkerProfileUpdateRequest;
import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.ArrayList;
import com.itp.skilledworker.dto.UserProfileResponse;
import com.itp.skilledworker.dto.UpdateProfileRequest;

@Service
@RequiredArgsConstructor
public class UserService {
    // Consolidates user/profile operations used by worker, customer, supplier, and admin flows.

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final SupplierProfileRepository supplierProfileRepository;
    private final WorkerAvailabilityRepository workerAvailabilityRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    /**
     * Returns worker profiles filtered by optional district/category and excludes inactive user accounts.
     */
    public List<WorkerProfile> getAllWorkers(String district, String category) {
        boolean hasDistrict = district != null && !district.isBlank();
        boolean hasCategory = category != null && !category.isBlank();
        List<WorkerProfile> base;

        if (hasDistrict && hasCategory) {
            base = workerProfileRepository.findByDistrictAndSkillCategoryIgnoreCase(district, category);
        } else if (hasDistrict) {
            base = workerProfileRepository.findByDistrict(district);
        } else if (hasCategory) {
            base = workerProfileRepository.findBySkillCategoryIgnoreCase(category);
        } else {
            base = workerProfileRepository.findAll();
        }

        // Only return workers whose underlying user accounts are active.
        return base.stream()
                .filter(w -> w.getUser() != null && Boolean.TRUE.equals(w.getUser().getIsActive()))
                .map(this::applyLiveWorkerStats)
                .toList();
    }

    /**
     * Loads a single worker profile by worker id and enriches it with live rating/job stats.
     */
    public WorkerProfile getWorkerById(Integer workerId) {
        WorkerProfile profile = workerProfileRepository.findById(workerId)
            .orElseThrow(() -> new RuntimeException("Worker not found"));
        return applyLiveWorkerStats(profile);
    }

    /**
     * Resolves the authenticated user by email, then returns the related worker profile with live stats.
     */
    public WorkerProfile getWorkerByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WorkerProfile profile = workerProfileRepository.findByUser_UserId(user.getUserId())
            .orElseThrow(() -> new RuntimeException("Worker profile not found"));
        return applyLiveWorkerStats(profile);
    }

        /**
         * Computes current completed job count and average rating from bookings/reviews for display.
         */
        private WorkerProfile applyLiveWorkerStats(WorkerProfile profile) {
        if (profile == null || profile.getWorkerId() == null) {
            return profile;
        }

        // Dashboard/listing values are derived live from bookings + reviews.
        long completedJobs = bookingRepository.countByWorker_WorkerIdAndBookingStatus(
            profile.getWorkerId(), Booking.BookingStatus.completed);

        Integer workerUserId = profile.getUser() != null ? profile.getUser().getUserId() : null;
        Double avgRating = workerUserId == null ? 0.0 : reviewRepository.findAverageRatingByRevieweeUserId(workerUserId);

        profile.setTotalJobs((int) completedJobs);
        profile.setAverageRating(BigDecimal.valueOf(avgRating == null ? 0.0 : avgRating));
        return profile;
        }

    @Transactional
    /**
     * Updates editable worker profile fields for the currently authenticated user.
     */
    public WorkerProfile updateWorkerProfile(String email, WorkerProfileUpdateRequest updated) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WorkerProfile profile = workerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

        if (updated.getHourlyRateMin() != null && updated.getHourlyRateMax() != null
            && updated.getHourlyRateMax().compareTo(updated.getHourlyRateMin()) <= 0) {
            throw new IllegalArgumentException("Hourly rate max must be greater than hourly rate min.");
        }

        if (updated.getFirstName() != null)
            profile.setFirstName(updated.getFirstName());
        if (updated.getLastName() != null)
            profile.setLastName(updated.getLastName());
        if (updated.getBio() != null)
            profile.setBio(updated.getBio());
        if (updated.getCity() != null)
            profile.setCity(updated.getCity());
        if (updated.getDistrict() != null)
            profile.setDistrict(updated.getDistrict());
        if (updated.getSkillCategory() != null)
            profile.setSkillCategory(updated.getSkillCategory());
        if (updated.getHourlyRateMin() != null)
            profile.setHourlyRateMin(updated.getHourlyRateMin());
        if (updated.getHourlyRateMax() != null)
            profile.setHourlyRateMax(updated.getHourlyRateMax());

        return workerProfileRepository.save(profile);
    }

    @Transactional
    /**
     * Soft-deactivates a user account by setting isActive to false.
     */
    public void deactivateUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // User-initiated account deactivation (soft delete).
        user.setIsActive(false);
        userRepository.save(user);
    }

    /**
     * Returns all user accounts for admin management screens.
     */
    public List<User> getAllUsers() {
        // Admin management view needs all accounts regardless of role.
        return userRepository.findAll();
    }

    /**
     * Toggles the active/inactive state of a user account.
     */
    public User toggleUserActive(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Flip account state instead of removing rows to preserve audit/history links.
        user.setIsActive(!user.getIsActive());
        return userRepository.save(user);
    }

    /**
     * Builds a unified profile response by merging base user fields with role-specific profile data.
     */
    public UserProfileResponse getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Base user fields; role-specific fields are added below.
        var response = UserProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .build();

        if (user.getRole() == User.Role.worker) {
            // Worker account -> read fields from worker_profiles.
            workerProfileRepository.findByUser_UserId(user.getUserId()).ifPresent(p -> {
                response.setFirstName(p.getFirstName());
                response.setLastName(p.getLastName());
                response.setCity(p.getCity());
                response.setDistrict(p.getDistrict());
                response.setProfilePicture(p.getProfilePicture());
                response.setBio(p.getBio());
                response.setHourlyRateMin(p.getHourlyRateMin());
                response.setHourlyRateMax(p.getHourlyRateMax());
                response.setAverageRating(p.getAverageRating() != null ? p.getAverageRating().doubleValue() : 0.0);
            });
        } else if (user.getRole() == User.Role.customer) {
            // Customer account -> read fields from customer_profiles.
            customerProfileRepository.findByUser_UserId(user.getUserId()).ifPresent(p -> {
                response.setFirstName(p.getFirstName());
                response.setLastName(p.getLastName());
                response.setCity(p.getCity());
                response.setDistrict(p.getDistrict());
                response.setProfilePicture(p.getProfilePicture());
            });
        } else if (user.getRole() == User.Role.supplier) {
            // Supplier account -> read fields from supplier_profiles.
            supplierProfileRepository.findByUser_UserId(user.getUserId()).ifPresent(p -> {
                response.setBusinessName(p.getBusinessName());
                response.setBusinessRegistrationNumber(p.getBusinessRegistrationNumber());
                response.setContactPersonName(p.getContactPersonName());
                response.setCity(p.getCity());
                response.setDistrict(p.getDistrict());
            });
        }

        return response;
    }

    @Transactional
    /**
     * Updates profile details for the matching role table and returns the latest combined profile response.
     */
    public UserProfileResponse updateProfileByEmail(String email, UpdateProfileRequest updated) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updated.getPhone() != null)
            user.setPhone(updated.getPhone());
        userRepository.save(user);

        // Update the profile table that matches the account role.
        if (user.getRole() == User.Role.worker) {
            WorkerProfile p = workerProfileRepository.findByUser_UserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Worker profile not found"));
            if (updated.getHourlyRateMin() != null && updated.getHourlyRateMax() != null
                    && updated.getHourlyRateMax().compareTo(updated.getHourlyRateMin()) <= 0) {
                throw new IllegalArgumentException("Hourly rate max must be greater than hourly rate min.");
            }
            if (updated.getFirstName() != null)
                p.setFirstName(updated.getFirstName());
            if (updated.getLastName() != null)
                p.setLastName(updated.getLastName());
            if (updated.getCity() != null)
                p.setCity(updated.getCity());
            if (updated.getDistrict() != null)
                p.setDistrict(updated.getDistrict());
            if (updated.getBio() != null)
                p.setBio(updated.getBio());
            if (updated.getHourlyRateMin() != null)
                p.setHourlyRateMin(updated.getHourlyRateMin());
            if (updated.getHourlyRateMax() != null)
                p.setHourlyRateMax(updated.getHourlyRateMax());
            if (updated.getProfilePicture() != null)
                p.setProfilePicture(updated.getProfilePicture());
            workerProfileRepository.save(p);
        } else if (user.getRole() == User.Role.customer) {
            CustomerProfile p = customerProfileRepository.findByUser_UserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Customer profile not found"));
            if (updated.getFirstName() != null)
                p.setFirstName(updated.getFirstName());
            if (updated.getLastName() != null)
                p.setLastName(updated.getLastName());
            if (updated.getCity() != null)
                p.setCity(updated.getCity());
            if (updated.getDistrict() != null)
                p.setDistrict(updated.getDistrict());
            if (updated.getProfilePicture() != null)
                p.setProfilePicture(updated.getProfilePicture());
            customerProfileRepository.save(p);
        } else if (user.getRole() == User.Role.supplier) {
            SupplierProfile p = supplierProfileRepository.findByUser_UserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Supplier profile not found"));
            if (updated.getBusinessName() != null)
                p.setBusinessName(updated.getBusinessName());
            if (updated.getBusinessRegistrationNumber() != null)
                p.setBusinessRegistrationNumber(updated.getBusinessRegistrationNumber());
            if (updated.getContactPersonName() != null)
                p.setContactPersonName(updated.getContactPersonName());
            if (updated.getCity() != null)
                p.setCity(updated.getCity());
            if (updated.getDistrict() != null)
                p.setDistrict(updated.getDistrict());
            supplierProfileRepository.save(p);
        }

        return getProfileByEmail(email);
    }

    /**
     * Returns current and future availability entries for a worker.
     */
    public List<WorkerAvailability> getWorkerAvailability(Integer workerId) {
        return workerAvailabilityRepository.findByWorker_WorkerIdAndAvailableDateGreaterThanEqual(workerId,
                LocalDate.now());
    }

    @Transactional
    /**
     * Creates a single availability slot for the authenticated worker.
     */
    public WorkerAvailability addAvailability(String email, LocalDate date, LocalTime start, LocalTime end,
            String note) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WorkerProfile worker = workerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

        WorkerAvailability availability = new WorkerAvailability();
        availability.setWorker(worker);
        availability.setAvailableDate(date);
        availability.setStartTime(start);
        availability.setEndTime(end);
        availability.setNote(note);
        return workerAvailabilityRepository.save(availability);
    }

    @Transactional
    /**
     * Upserts multiple availability slots for the same date using worker/date/start/end as identity.
     */
    public List<WorkerAvailability> upsertAvailabilitySlots(String email, LocalDate date,
            List<WorkerAvailability> slotPayloads) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WorkerProfile worker = workerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

        // Idempotent upsert based on worker/date/start/end.
        List<WorkerAvailability> saved = new ArrayList<>();
        for (WorkerAvailability slot : slotPayloads) {
            if (slot.getStartTime() == null || slot.getEndTime() == null) {
                throw new RuntimeException("Slot start and end times are required");
            }
            if (!slot.getEndTime().isAfter(slot.getStartTime())) {
                throw new RuntimeException("Slot end time must be after start time");
            }

            WorkerAvailability row = workerAvailabilityRepository
                    .findFirstByWorker_WorkerIdAndAvailableDateAndStartTimeAndEndTime(
                            worker.getWorkerId(), date, slot.getStartTime(), slot.getEndTime())
                    .orElseGet(() -> {
                        WorkerAvailability created = new WorkerAvailability();
                        created.setWorker(worker);
                        created.setAvailableDate(date);
                        created.setStartTime(slot.getStartTime());
                        created.setEndTime(slot.getEndTime());
                        return created;
                    });

            row.setIsAvailable(slot.getIsAvailable() != null ? slot.getIsAvailable() : false);
            row.setNote(slot.getNote());
            saved.add(workerAvailabilityRepository.save(row));
        }
        return saved;
    }

    @Transactional
    /**
     * Deletes a worker availability slot after validating ownership.
     */
    public void deleteAvailability(String email, Long availabilityId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WorkerAvailability availability = workerAvailabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        if (!availability.getWorker().getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized: You don't own this availability record");
        }
        workerAvailabilityRepository.delete(availability);
    }
}
