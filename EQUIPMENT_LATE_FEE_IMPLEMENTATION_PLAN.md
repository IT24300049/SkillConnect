# Equipment Rental Late Fee Plan

## 1. Recommendation

Yes, adding a supplier-configurable "Late Fee Per Day" field when creating/updating equipment is a strong approach.

Reason:
- It gives suppliers pricing control per equipment item (high-value tools can have higher late fees).
- It is transparent to customers before booking.
- It removes dependency on one global percentage for all equipment.

Recommended model:
- Store late fee per day in equipment inventory.
- Copy that value into each booking at booking time as a snapshot.
- Calculate overdue fee from the booking snapshot (not from current inventory value).

This prevents fee changes from affecting old bookings.

## 2. Current State (Observed)

From current code and schema:
- `equipment_bookings` already has `late_fee` (total late fee amount).
- Backend endpoint exists: `GET /api/equipment/bookings/{bookingId}/late-fee`.
- Stored procedure exists: `calculate_late_fee`.
- Current procedure uses global `system_settings.late_fee_percentage` and `daily_rate`.
- Supplier "Add New Equipment" form currently has no per-day late fee input.

Gap:
- Late fee logic is global percentage-based, not supplier-configurable per item.

## 3. DB Design Changes

### 3.1 New columns

```sql
ALTER TABLE equipment_inventory
  ADD COLUMN late_fee_per_day DECIMAL(10,2) NOT NULL DEFAULT 0.00
  AFTER rental_price_per_day;

ALTER TABLE equipment_bookings
  ADD COLUMN late_fee_per_day_snapshot DECIMAL(10,2) NOT NULL DEFAULT 0.00
  AFTER daily_rate,
  ADD COLUMN overdue_days INT NOT NULL DEFAULT 0
  AFTER late_fee_per_day_snapshot;
```

### 3.2 Backfill data

Option A (simple default):

```sql
UPDATE equipment_inventory
SET late_fee_per_day = ROUND(rental_price_per_day * 0.10, 2)
WHERE late_fee_per_day = 0;
```

Option B (safer rollout):
- Start with `0.00` and let suppliers set values item by item.

### 3.3 Update late fee calculation logic

Update stored procedure to use booking snapshot:
- `days_overdue = max(0, datediff(coalesce(actual_return_date, curdate()), rental_end_date))`
- `total_late_fee = days_overdue * late_fee_per_day_snapshot * quantity_rented`

Also update booking totals:
- `late_fee = total_late_fee`
- `overdue_days = days_overdue`
- `total_cost = base_rental_cost + late_fee + damage_fee`

Important schema fix:
- `equipment_late_fees` currently uses `ON DUPLICATE KEY UPDATE`, but table has no unique key for `equipment_booking_id`.
- Add unique key so upsert works correctly:

```sql
ALTER TABLE equipment_late_fees
  ADD UNIQUE KEY uk_equipment_booking_id (equipment_booking_id);
```

## 4. Backend Changes

### 4.1 Entity updates

Update:
- `EquipmentInventory` with `lateFeePerDay`.
- `EquipmentBooking` with `lateFeePerDaySnapshot` and `overdueDays`.

### 4.2 DTO updates

Add field to:
- `EquipmentCreateRequest`
- `EquipmentUpdateRequest`

Validation:
- `@DecimalMin(value = "0.0", inclusive = true)` for late fee per day.

### 4.3 Service updates

In `addEquipment` and `updateEquipment`:
- Save `lateFeePerDay`.

In `bookEquipment`:
- Copy `equipment.lateFeePerDay` into `booking.lateFeePerDaySnapshot`.

In `returnEquipment`:
- Keep quantity restore behavior.
- Trigger late fee calculation (or call procedure directly) before final return response.

### 4.4 Controller/API contract

No new endpoint required initially.

Update payloads and responses:
- Add `lateFeePerDay` in equipment create/update APIs.
- Include `lateFeePerDay` in equipment list/detail responses.
- Include `lateFeePerDaySnapshot`, `overdueDays`, `lateFee` in booking responses.

## 5. Frontend Changes

## 5.1 Supplier upload/edit modal

Add field:
- Label: `Late Fee Per Day (LKR)`
- Type: number
- Min: 0
- Step: 0.01

Send as:
- `lateFeePerDay` in add/update payload.

## 5.2 Customer views

In equipment card/detail:
- Show `Late Fee: Rs.X / day`.

In My Rentals table:
- Add columns or details for:
  - Late fee/day
  - Overdue days
  - Total late fee

On return action:
- Display updated totals including late fee.

## 5.3 UX transparency

Before booking confirm:
- Show estimated late penalty rule:
  - `Late penalty = late fee/day x overdue days x quantity`

## 6. Alternatives

### Alternative 1: Keep current global percentage (existing)

How it works:
- Use `system_settings.late_fee_percentage` for all equipment.

Pros:
- Very simple to manage.
- No UI/schema change for supplier field.

Cons:
- Not flexible for different tool values.
- Can feel unfair for premium vs basic equipment.

### Alternative 2: Category-level late fee

How it works:
- Add late fee/day at `equipment_categories` level.

Pros:
- Easier than per-item management.
- More flexible than global.

Cons:
- Still too coarse for unique items.

### Alternative 3: Hybrid (recommended if needed later)

Priority logic:
- If equipment-specific late fee exists, use it.
- Else use category default.
- Else use global default.

Pros:
- Best flexibility and fallback.

Cons:
- More complexity in data model and logic.

## 7. Suggested Rollout Plan

Phase 1 (DB + backend contract)
- Add DB columns and unique key.
- Update entities, DTOs, service, and stored procedure.
- Keep current UI unchanged temporarily.

Phase 2 (supplier UI)
- Add late fee/day field to add/edit equipment modal.
- Validate and submit payload.

Phase 3 (customer visibility)
- Show late fee/day on equipment pages.
- Show overdue breakdown in bookings table.

Phase 4 (testing + release)
- Run migration on staging data.
- Validate all booking statuses and fee outputs.
- Release to production.

## 8. Testing Checklist

Functional:
- Supplier can create equipment with late fee/day.
- Supplier can update late fee/day for new future bookings.
- Booking stores snapshot at booking time.
- Returning on time keeps late fee = 0.
- Returning late calculates correct overdue days and fee.
- Quantity-rented bookings multiply late fee correctly.

Edge cases:
- Zero late fee/day should produce zero late fee.
- Booking returned twice should not duplicate penalties.
- Updating equipment late fee does not change old booking snapshots.

Data integrity:
- `equipment_late_fees` has one row per booking (upsert works).

## 9. Final Answer to Your Question

Your idea is correct and should be implemented.

Best practical approach:
- Add `late_fee_per_day` on supplier equipment upload/edit.
- Snapshot it into booking when rental is created.
- Calculate final penalty from snapshot at return time.

If you want lower complexity for now, start with global percentage only, then move to supplier-specific late fee in the next iteration.
