package com.itp.skilledworker.service;

import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentInventoryRepository inventoryRepository;
    private final EquipmentBookingRepository bookingRepository;
    private final EquipmentCategoryRepository categoryRepository;
    private final SupplierProfileRepository supplierRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final UserRepository userRepository;

    @Value("${upload.equipment-dir:uploads/equipment}")
    private String uploadDir;

    private static final long MAX_FILE_BYTES = 5L * 1024 * 1024; // 5 MB
    private static final String[] ALLOWED_TYPES = { "image/jpeg", "image/png", "image/webp", "image/gif" };

    @Transactional
    public EquipmentInventory addEquipment(Integer supplierUserId, Integer categoryId,
            String name, String description, String condition,
            BigDecimal pricePerDay, BigDecimal lateFeePerDay, Integer qty) {
        SupplierProfile supplier = supplierRepository.findByUser_UserId(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Supplier profile not found"));
        EquipmentCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        EquipmentInventory equipment = new EquipmentInventory();
        equipment.setSupplier(supplier);
        equipment.setEquipmentCategory(category);
        equipment.setEquipmentName(name);
        equipment.setEquipmentDescription(description);
        equipment.setEquipmentCondition(EquipmentInventory.EquipmentCondition.valueOf(condition.toLowerCase()));
        equipment.setRentalPricePerDay(pricePerDay);
        equipment.setLateFeePerDay(lateFeePerDay == null ? BigDecimal.ZERO : lateFeePerDay);
        equipment.setQuantityTotal(qty);
        equipment.setQuantityAvailable(qty);
        equipment.setIsAvailable(true);
        return inventoryRepository.save(equipment);
    }

    public List<EquipmentInventory> getAvailableEquipment() {
        return inventoryRepository.findByIsAvailableAndQuantityAvailableGreaterThan(true, 0);
    }

    public List<EquipmentInventory> getAllEquipment() {
        return inventoryRepository.findAll();
    }

    public EquipmentInventory getEquipmentById(Integer id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
    }

    @Transactional
    public EquipmentInventory updateEquipment(Integer equipmentId, String name, String description,
            BigDecimal pricePerDay, BigDecimal lateFeePerDay) {
        EquipmentInventory eq = getEquipmentById(equipmentId);
        if (name != null)
            eq.setEquipmentName(name);
        if (description != null)
            eq.setEquipmentDescription(description);
        if (pricePerDay != null)
            eq.setRentalPricePerDay(pricePerDay);
        if (lateFeePerDay != null)
            eq.setLateFeePerDay(lateFeePerDay);
        return inventoryRepository.save(eq);
    }

    @Transactional
    public void deleteEquipment(Integer equipmentId) {
        inventoryRepository.deleteById(equipmentId);
    }

    @Transactional
    public EquipmentBooking bookEquipment(Integer equipmentId, Integer customerUserId,
            String startDate, String endDate, Integer quantity, String notes) {
        EquipmentInventory equipment = getEquipmentById(equipmentId);
        int requestedQty = quantity == null ? 1 : quantity;
        if (requestedQty < 1) {
            throw new RuntimeException("Quantity must be at least 1");
        }

        int availableQty = equipment.getQuantityAvailable() == null ? 0 : equipment.getQuantityAvailable();
        if (availableQty < requestedQty) {
            throw new RuntimeException("Equipment not available");
        }
        CustomerProfile customer = resolveBookerProfile(customerUserId);

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        long days = ChronoUnit.DAYS.between(start, end);
        if (days <= 0)
            throw new RuntimeException("End date must be after start date");

        BigDecimal baseCost = equipment.getRentalPricePerDay()
            .multiply(BigDecimal.valueOf(days))
            .multiply(BigDecimal.valueOf(requestedQty));

        EquipmentBooking booking = new EquipmentBooking();
        booking.setEquipment(equipment);
        booking.setCustomer(customer);
        booking.setSupplier(equipment.getSupplier());
        booking.setRentalStartDate(start);
        booking.setRentalEndDate(end);
        booking.setDailyRate(equipment.getRentalPricePerDay());
        booking.setLateFeePerDaySnapshot(
            equipment.getLateFeePerDay() == null ? BigDecimal.ZERO : equipment.getLateFeePerDay());
        booking.setTotalDays((int) days);
        booking.setQuantityRented(requestedQty);
        booking.setBaseRentalCost(baseCost);
        booking.setTotalCost(baseCost);
        booking.setNotes(notes);
        booking.setBookingStatus(EquipmentBooking.BookingStatus.reserved);

        equipment.setQuantityAvailable(availableQty - requestedQty);
        equipment.setIsAvailable((availableQty - requestedQty) > 0);
        inventoryRepository.save(equipment);

        return bookingRepository.save(booking);
    }

    @Transactional
    public EquipmentBooking returnEquipment(Integer bookingId) {
        EquipmentBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Equipment booking not found"));

        if (booking.getBookingStatus() == EquipmentBooking.BookingStatus.returned) {
            throw new RuntimeException("Equipment is already returned");
        }

        EquipmentInventory equipment = booking.getEquipment();
        int currentAvailable = equipment.getQuantityAvailable() == null ? 0 : equipment.getQuantityAvailable();
        int totalQty = equipment.getQuantityTotal() == null ? currentAvailable : equipment.getQuantityTotal();
        int returnedQty = booking.getQuantityRented() == null ? 1 : booking.getQuantityRented();
        int updatedAvailable = Math.min(totalQty, currentAvailable + returnedQty);

        equipment.setQuantityAvailable(updatedAvailable);
        equipment.setIsAvailable(updatedAvailable > 0);
        inventoryRepository.save(equipment);

        booking.setActualReturnDate(LocalDate.now());
        booking.setBookingStatus(EquipmentBooking.BookingStatus.returned);
        EquipmentBooking returned = bookingRepository.save(booking);
        // Avoid calling the stored procedure within this transaction; if the procedure
        // is missing, the transaction can become rollback-only.
        return recalculateLateFeeInApp(returned);
    }

    public Map<String, Object> calculateLateFee(Integer bookingId) {
        EquipmentBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Equipment booking not found"));

        try {
            // Delegate late fee calculation to the database stored procedure when available.
            bookingRepository.callCalculateLateFee(bookingId);
        } catch (Exception ex) {
            recalculateLateFeeInApp(booking);
        }

        // Reload booking to get updated late fee and total cost
        EquipmentBooking updated = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Equipment booking not found"));

        if (updated.getLateFee() == null || updated.getLateFee().compareTo(BigDecimal.ZERO) == 0) {
            return Map.of(
                    "bookingId", bookingId,
                    "daysOverdue", 0,
                "dailyLateFeeRate", updated.getLateFeePerDaySnapshot() == null ? BigDecimal.ZERO
                    : updated.getLateFeePerDaySnapshot(),
                    "totalLateFee", BigDecimal.ZERO,
                    "rentalEndDate", updated.getRentalEndDate().toString(),
                    "message", "Not overdue");
        }

        int daysOverdue = updated.getOverdueDays() == null ? 0 : updated.getOverdueDays();
        BigDecimal dailyLateFeeRate = updated.getLateFeePerDaySnapshot() == null
            ? BigDecimal.ZERO
            : updated.getLateFeePerDaySnapshot();

        return Map.of(
                "bookingId", bookingId,
                "daysOverdue", daysOverdue,
                "dailyLateFeeRate", dailyLateFeeRate,
                "totalLateFee", updated.getLateFee(),
                "rentalEndDate", updated.getRentalEndDate().toString());
    }

    private EquipmentBooking recalculateLateFeeInApp(EquipmentBooking booking) {
        LocalDate dueDate = booking.getRentalEndDate();
        LocalDate effectiveReturnDate = booking.getActualReturnDate() != null ? booking.getActualReturnDate() : LocalDate.now();

        long overdueLong = ChronoUnit.DAYS.between(dueDate, effectiveReturnDate);
        int overdueDays = (int) Math.max(0, overdueLong);

        BigDecimal dailyLate = booking.getLateFeePerDaySnapshot() == null ? BigDecimal.ZERO : booking.getLateFeePerDaySnapshot();
        int qty = booking.getQuantityRented() == null ? 1 : booking.getQuantityRented();

        BigDecimal totalLate = dailyLate
                .multiply(BigDecimal.valueOf(overdueDays))
                .multiply(BigDecimal.valueOf(qty));

        BigDecimal baseCost = booking.getBaseRentalCost() == null ? BigDecimal.ZERO : booking.getBaseRentalCost();
        BigDecimal damageFee = booking.getDamageFee() == null ? BigDecimal.ZERO : booking.getDamageFee();

        booking.setOverdueDays(overdueDays);
        booking.setLateFee(totalLate);
        booking.setTotalCost(baseCost.add(totalLate).add(damageFee));

        return bookingRepository.save(booking);
    }

    public List<EquipmentBooking> getCustomerBookings(Integer customerUserId) {
        CustomerProfile customer = resolveBookerProfile(customerUserId);
        return bookingRepository.findByCustomer_CustomerId(customer.getCustomerId());
    }

    private CustomerProfile resolveBookerProfile(Integer userId) {
        return customerProfileRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    // Equipment renting is enabled for both customer and worker accounts.
                    if (user.getRole() != User.Role.customer && user.getRole() != User.Role.worker) {
                        throw new RuntimeException("Only customers and workers can rent equipment");
                    }

                    String localPart = user.getEmail() != null && user.getEmail().contains("@")
                            ? user.getEmail().substring(0, user.getEmail().indexOf('@'))
                            : "User";

                    CustomerProfile profile = new CustomerProfile();
                    profile.setUser(user);
                    profile.setFirstName(localPart);
                    profile.setLastName("Renter");
                    profile.setCity(null);
                    profile.setDistrict(null);
                    return customerProfileRepository.save(profile);
                });
    }

    public List<EquipmentBooking> getSupplierBookings(Integer supplierUserId) {
        SupplierProfile supplier = supplierRepository.findByUser_UserId(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Supplier profile not found"));
        return bookingRepository.findBySupplier_SupplierId(supplier.getSupplierId());
    }

    public List<EquipmentCategory> getCategories() {
        return categoryRepository.findAll();
    }

    public List<EquipmentInventory> getSupplierEquipment(Integer supplierUserId) {
        SupplierProfile supplier = supplierRepository.findByUser_UserId(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Supplier profile not found"));
        return inventoryRepository.findBySupplier_SupplierId(supplier.getSupplierId());
    }

    @Transactional
    public EquipmentInventory uploadEquipmentImage(Integer equipmentId, MultipartFile imageFile) throws IOException {
        EquipmentInventory equipment = getEquipmentById(equipmentId);

        if (imageFile == null || imageFile.isEmpty()) {
            throw new RuntimeException("Image file is required");
        }

        validateImage(imageFile);

        Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(baseDir);

        String imagePath = saveFile(baseDir, equipmentId, imageFile);
        equipment.setImagePath(imagePath);

        return inventoryRepository.save(equipment);
    }

    private void validateImage(MultipartFile file) {
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new RuntimeException("Image file size exceeds 5MB limit");
        }

        String contentType = file.getContentType();
        boolean isAllowed = false;
        for (String type : ALLOWED_TYPES) {
            if (type.equals(contentType)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new RuntimeException("Only JPEG, PNG, WebP, and GIF images are allowed");
        }
    }

    private String saveFile(Path baseDir, Integer equipmentId, MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = "equipment_" + equipmentId + "_" + UUID.randomUUID() + extension;
        Path filePath = baseDir.resolve(filename).normalize();

        if (!filePath.getParent().equals(baseDir.normalize())) {
            throw new RuntimeException("Invalid file path");
        }

        file.transferTo(filePath.toFile());
        return "/uploads/equipment/" + filename;
    }
}
