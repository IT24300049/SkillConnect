-- Equipment Late Fee Per Day migration
-- Run this against your active database (example: skilled_worker_booking)

-- 1) Add per-equipment late fee config
ALTER TABLE equipment_inventory
  ADD COLUMN late_fee_per_day DECIMAL(10,2) NOT NULL DEFAULT 0.00
  AFTER rental_price_per_day;

-- 2) Add booking snapshot fields for stable late-fee calculation
ALTER TABLE equipment_bookings
  ADD COLUMN late_fee_per_day_snapshot DECIMAL(10,2) NOT NULL DEFAULT 0.00
  AFTER daily_rate,
  ADD COLUMN overdue_days INT NOT NULL DEFAULT 0
  AFTER total_days;

-- 3) Ensure one late fee row per booking so upsert works
ALTER TABLE equipment_late_fees
  ADD UNIQUE KEY uk_equipment_booking_id (equipment_booking_id);

-- 4) Optional backfill defaults for existing inventory rows
UPDATE equipment_inventory
SET late_fee_per_day = ROUND(rental_price_per_day * 0.10, 2)
WHERE late_fee_per_day = 0;

-- 5) Backfill booking snapshots from equipment records for existing bookings
UPDATE equipment_bookings eb
JOIN equipment_inventory ei ON ei.equipment_id = eb.equipment_id
SET eb.late_fee_per_day_snapshot = ei.late_fee_per_day
WHERE eb.late_fee_per_day_snapshot = 0;

-- 6) Replace procedure to use booking snapshot instead of global percentage
DROP PROCEDURE IF EXISTS calculate_late_fee;

DELIMITER //
CREATE PROCEDURE calculate_late_fee(IN booking_id INT)
BEGIN
    DECLARE v_due_date DATE;
    DECLARE v_effective_return_date DATE;
    DECLARE v_daily_late_fee_rate DECIMAL(10, 2);
    DECLARE v_quantity_rented INT;
    DECLARE v_overdue_days INT;
    DECLARE v_total_late_fee DECIMAL(10, 2);

    SELECT
        rental_end_date,
        COALESCE(actual_return_date, CURDATE()),
        COALESCE(late_fee_per_day_snapshot, 0),
        COALESCE(quantity_rented, 1)
    INTO v_due_date, v_effective_return_date, v_daily_late_fee_rate, v_quantity_rented
    FROM equipment_bookings
    WHERE equipment_booking_id = booking_id;

    SET v_overdue_days = GREATEST(DATEDIFF(v_effective_return_date, v_due_date), 0);
    SET v_total_late_fee = v_overdue_days * v_daily_late_fee_rate * v_quantity_rented;

    INSERT INTO equipment_late_fees (
        equipment_booking_id,
        days_overdue,
        daily_late_fee_rate,
        total_late_fee,
        fee_status
    ) VALUES (
        booking_id,
        v_overdue_days,
        v_daily_late_fee_rate,
        v_total_late_fee,
        CASE WHEN v_total_late_fee > 0 THEN 'pending' ELSE 'waived' END
    )
    ON DUPLICATE KEY UPDATE
        days_overdue = VALUES(days_overdue),
        daily_late_fee_rate = VALUES(daily_late_fee_rate),
        total_late_fee = VALUES(total_late_fee),
        fee_status = CASE WHEN VALUES(total_late_fee) > 0 THEN fee_status ELSE 'waived' END,
        calculated_at = CURRENT_TIMESTAMP;

    UPDATE equipment_bookings
    SET overdue_days = v_overdue_days,
        late_fee = v_total_late_fee,
        total_cost = base_rental_cost + v_total_late_fee + COALESCE(damage_fee, 0)
    WHERE equipment_booking_id = booking_id;
END //
DELIMITER ;
