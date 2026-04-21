package com.itp.skilledworker.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_inventory")
@Data
@NoArgsConstructor
public class EquipmentInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipment_id")
    private Integer equipmentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private SupplierProfile supplier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipment_category_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private EquipmentCategory equipmentCategory;

    @Column(name = "equipment_name", nullable = false)
    private String equipmentName;

    @Column(name = "equipment_description", columnDefinition = "TEXT")
    private String equipmentDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_condition", nullable = false)
    private EquipmentCondition equipmentCondition;

    @Column(name = "rental_price_per_day", nullable = false)
    private BigDecimal rentalPricePerDay;

    @Column(name = "late_fee_per_day", nullable = false)
    private BigDecimal lateFeePerDay = BigDecimal.ZERO;

    @Column(name = "quantity_available")
    private Integer quantityAvailable = 1;

    @Column(name = "quantity_total")
    private Integer quantityTotal = 1;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

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

    public enum EquipmentCondition {
        new_, excellent, good, fair
    }
}
