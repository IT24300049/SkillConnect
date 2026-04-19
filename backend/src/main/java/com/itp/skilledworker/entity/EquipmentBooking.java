package com.itp.skilledworker.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_bookings")
@Data
@NoArgsConstructor
public class EquipmentBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipment_booking_id")
    private Integer equipmentBookingId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipment_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private EquipmentInventory equipment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CustomerProfile customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private SupplierProfile supplier;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status")
    private BookingStatus bookingStatus = BookingStatus.reserved;

    @Column(name = "rental_start_date", nullable = false)
    private LocalDate rentalStartDate;

    @Column(name = "rental_end_date", nullable = false)
    private LocalDate rentalEndDate;

    @Column(name = "actual_return_date")
    private LocalDate actualReturnDate;

    @Column(name = "quantity_rented")
    private Integer quantityRented = 1;

    @Column(name = "daily_rate", nullable = false)
    private BigDecimal dailyRate;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @Column(name = "base_rental_cost", nullable = false)
    private BigDecimal baseRentalCost;

    @Column(name = "late_fee")
    private BigDecimal lateFee = BigDecimal.ZERO;

    @Column(name = "damage_fee")
    private BigDecimal damageFee = BigDecimal.ZERO;

    @Column(name = "total_cost", nullable = false)
    private BigDecimal totalCost;

    @Column(name = "deposit_returned")
    private Boolean depositReturned = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.pending;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        available, reserved, rented_out, returned, damaged, cancelled
    }

    public enum PaymentStatus {
        pending, deposit_paid, fully_paid, refunded
    }
}
