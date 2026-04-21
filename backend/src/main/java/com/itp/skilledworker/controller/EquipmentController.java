package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.dto.EquipmentDtos.EquipmentBookingRequest;
import com.itp.skilledworker.dto.EquipmentDtos.EquipmentCreateRequest;
import com.itp.skilledworker.dto.EquipmentDtos.EquipmentUpdateRequest;
import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.UserRepository;
import com.itp.skilledworker.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentInventory>>> getAvailableEquipment() {
        return ResponseEntity.ok(ApiResponse.ok("Available equipment", equipmentService.getAvailableEquipment()));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<EquipmentInventory>>> getAllEquipment() {
        return ResponseEntity.ok(ApiResponse.ok("All equipment", equipmentService.getAllEquipment()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentInventory>> getEquipment(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Equipment", equipmentService.getEquipmentById(id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentInventory>> addEquipment(@Valid @RequestBody EquipmentCreateRequest body,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            EquipmentInventory eq = equipmentService.addEquipment(
                    userId,
                    body.getCategoryId(),
                    body.getEquipmentName(),
                    body.getEquipmentDescription(),
                    body.getEquipmentCondition(),
                    body.getRentalPricePerDay(),
                    body.getLateFeePerDay(),
                    body.getQuantityTotal());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Equipment added", eq));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentInventory>> updateEquipment(@PathVariable Integer id,
            @Valid @RequestBody EquipmentUpdateRequest body) {
        try {
            EquipmentInventory eq = equipmentService.updateEquipment(
                    id,
                    body.getEquipmentName(),
                    body.getEquipmentDescription(),
                    body.getRentalPricePerDay(),
                    body.getLateFeePerDay());
            return ResponseEntity.ok(ApiResponse.ok("Equipment updated", eq));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteEquipment(@PathVariable Integer id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok(ApiResponse.ok("Equipment deleted"));
    }

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<EquipmentBooking>> bookEquipment(@Valid @RequestBody EquipmentBookingRequest body,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            EquipmentBooking booking = equipmentService.bookEquipment(
                    body.getEquipmentId(),
                    userId,
                    body.getRentalStartDate(),
                    body.getRentalEndDate(),
                    body.getQuantity(),
                    body.getNotes());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Equipment booked", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/bookings/{bookingId}/return")
    public ResponseEntity<ApiResponse<EquipmentBooking>> returnEquipment(@PathVariable Integer bookingId) {
        try {
            EquipmentBooking booking = equipmentService.returnEquipment(bookingId);
            return ResponseEntity.ok(ApiResponse.ok("Equipment returned", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/bookings/{bookingId}/late-fee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateLateFee(@PathVariable Integer bookingId) {
        try {
            Map<String, Object> result = equipmentService.calculateLateFee(bookingId);
            return ResponseEntity.ok(ApiResponse.ok("Late fee calculated", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<EquipmentBooking>>> getMyBookings(Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            return ResponseEntity
                    .ok(ApiResponse.ok("My equipment bookings", equipmentService.getCustomerBookings(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/supplier/bookings")
    public ResponseEntity<ApiResponse<List<EquipmentBooking>>> getSupplierBookings(Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            return ResponseEntity
                    .ok(ApiResponse.ok("Supplier equipment bookings", equipmentService.getSupplierBookings(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<EquipmentCategory>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok("Categories", equipmentService.getCategories()));
    }

    
    @GetMapping("/supplier/mine")
    public ResponseEntity<ApiResponse<List<EquipmentInventory>>> getSupplierMine(Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            return ResponseEntity.ok(ApiResponse.ok("My supplier inventory", equipmentService.getSupplierEquipment(userId)));
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
