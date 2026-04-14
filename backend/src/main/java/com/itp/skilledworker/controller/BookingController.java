package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.dto.BookingDtos.BookingCreateRequest;
import com.itp.skilledworker.dto.BookingDtos.BookingStatusUpdateRequest;
import com.itp.skilledworker.dto.BookingDtos.BookingUpdateRequest;
import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.UserRepository;
import com.itp.skilledworker.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(@Valid @RequestBody BookingCreateRequest body,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            Booking booking = bookingService.createBooking(
                    body.getJobId(),
                    body.getWorkerId(),
                    userId,
                    body.getScheduledDate(),
                    body.getScheduledTime(),
                    body.getNotes());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Booking created", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Booking>>> getMyBookings(
            Authentication auth,
            @RequestParam(defaultValue = "customer") String as) {
        try {
            Integer userId = getUserId(auth);
            List<Booking> bookings;
            if ("worker".equalsIgnoreCase(as)) {
                bookings = bookingService.getBookingsForWorker(userId);
            } else {
                bookings = bookingService.getBookingsForCustomer(userId);
            }
            return ResponseEntity.ok(ApiResponse.ok("Bookings fetched", bookings));
        } catch (RuntimeException e) {
            if ("Worker profile not found".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Worker profile not found for the current user."));
            }
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBooking(@PathVariable Integer id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(ApiResponse.ok("Booking fetched", booking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Booking>> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody BookingStatusUpdateRequest body,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            Booking updated = bookingService.updateBookingStatus(id, body.getStatus(), userId, body.getReason());
            return ResponseEntity.ok(ApiResponse.ok("Booking status updated to " + body.getStatus(), updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<BookingStatusHistory>>> getHistory(@PathVariable Integer id) {
        List<BookingStatusHistory> history = bookingService.getBookingHistory(id);
        return ResponseEntity.ok(ApiResponse.ok("Booking history", history));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> updateBooking(
            @PathVariable Integer id,
            @Valid @RequestBody BookingUpdateRequest body,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            Booking updated = bookingService.updateBookingNotes(
                    id, userId,
                    body.getNotes(),
                    body.getScheduledDate(),
                    body.getScheduledTime());
            return ResponseEntity.ok(ApiResponse.ok("Booking updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteBooking(@PathVariable Integer id, Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            bookingService.deleteBooking(id, userId);
            return ResponseEntity.ok(ApiResponse.ok("Booking deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Booking>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.ok("All bookings", bookingService.getAllBookings()));
    }

    @GetMapping("/worker/{workerId}/busy-dates")
    public ResponseEntity<ApiResponse<List<java.time.LocalDate>>> getBusyDates(@PathVariable Integer workerId) {
        return ResponseEntity.ok(ApiResponse.ok("Busy dates", bookingService.getWorkerBusyDates(workerId)));
    }

    @GetMapping("/worker/{workerId}/busy-slots")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getBusySlots(@PathVariable Integer workerId) {
        return ResponseEntity.ok(ApiResponse.ok("Busy slots", bookingService.getWorkerBusySlots(workerId)));
    }

    private Integer getUserId(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getUserId();
    }
}
