-- ============================================================================
-- EQUIPMENT CATEGORIES MANAGEMENT FOR SKILLED WORKER BOOKING SYSTEM
-- ============================================================================
-- This file shows the equipment categories setup and how to add/modify them
-- ============================================================================

USE skilled_worker_booking;

-- ============================================================================
-- 1. VIEW CURRENT EQUIPMENT CATEGORIES
-- ============================================================================
-- Run this to see what equipment categories already exist
SELECT
    equipment_category_id,
    category_name,
    category_icon,
    description,
    is_active,
    created_at
FROM equipment_categories
ORDER BY category_name;

-- ============================================================================
-- 2. VIEW EQUIPMENT BY CATEGORY
-- ============================================================================
-- This shows how categories are being used in the equipment_inventory table
SELECT
    ec.category_name,
    COUNT(ei.equipment_id) as total_equipment,
    COUNT(CASE WHEN ei.is_available = TRUE THEN 1 END) as available_equipment,
    SUM(ei.quantity_total) as total_quantity
FROM equipment_categories ec
LEFT JOIN equipment_inventory ei ON ec.equipment_category_id = ei.equipment_category_id
GROUP BY ec.equipment_category_id, ec.category_name
ORDER BY total_equipment DESC;

-- ============================================================================
-- 3. ADD EQUIPMENT CATEGORIES (DEFAULT SET)
-- ============================================================================
-- Use this to add comprehensive equipment categories to your system

INSERT INTO equipment_categories (category_name, description, category_icon, is_active) VALUES
('Power Tools', 'Electric and battery-powered tools for construction and maintenance', '⚡', TRUE),
('Hand Tools', 'Manual tools and equipment for various tasks', '🔨', TRUE),
('Ladders & Scaffolding', 'Access equipment for working at heights', '🪜', TRUE),
('Concrete & Masonry Tools', 'Equipment for concrete work and masonry', '🧱', TRUE),
('Gardening Tools', 'Lawn and garden maintenance equipment', '🌱', TRUE),
('Safety Equipment', 'Personal protective equipment and safety gear', '🦺', TRUE),
('Painting Equipment', 'Tools and equipment for painting work', '🎨', TRUE),
('Plumbing Tools', 'Specialized tools for plumbing work', '🔧', TRUE),
('Electrical Tools', 'Tools for electrical work and installations', '⚡', TRUE),
('Welding Equipment', 'Welding machines and related equipment', '⚒️', TRUE),
('Generators & Power', 'Portable power generators and supplies', '🔌', TRUE),
('Compressors & Pneumatic', 'Air compressors and pneumatic tools', '💨', TRUE),
('Cleaning Equipment', 'Professional cleaning machines and tools', '🧹', TRUE),
('Lifting Equipment', 'Hoists, jacks, and lifting devices', '⬆️', TRUE),
('Measuring & Leveling', 'Precision measurement and leveling tools', '📏', TRUE),
('Cutting Tools', 'Saws, cutters, and cutting equipment', '✂️', TRUE),
('Demolition Tools', 'Equipment for demolition and breaking', '🔨', TRUE),
('Flooring Tools', 'Specialized equipment for flooring work', '🔲', TRUE),
('Tiling Tools', 'Tools for tile cutting and installation', '⬜', TRUE),
('Woodworking Tools', 'Equipment for carpentry and woodworking', '🪚', TRUE)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    category_icon = VALUES(category_icon),
    is_active = VALUES(is_active);

-- ============================================================================
-- 4. ADD MORE SPECIALIZED CATEGORIES
-- ============================================================================
-- Additional specialized equipment categories

INSERT INTO equipment_categories (category_name, description, category_icon, is_active) VALUES
('Pressure Washers', 'High-pressure cleaning equipment', '💦', TRUE),
('Drilling Equipment', 'Drills, core drills, and drilling accessories', '🔩', TRUE),
('Grinding & Polishing', 'Grinders, polishers, and surface preparation tools', '⚙️', TRUE),
('Roofing Tools', 'Specialized equipment for roofing work', '🏠', TRUE),
('HVAC Equipment', 'Heating, ventilation, and air conditioning tools', '❄️', TRUE),
('Fencing Tools', 'Equipment for fence installation and repair', '🔒', TRUE),
('Testing Equipment', 'Diagnostic and testing instruments', '🔬', TRUE),
('Material Handling', 'Carts, dollies, and transport equipment', '🚚', TRUE),
('Site Equipment', 'Construction site equipment and barriers', '🚧', TRUE),
('Pumps & Water Equipment', 'Water pumps and drainage equipment', '💧', TRUE)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    category_icon = VALUES(category_icon);

-- ============================================================================
-- 5. UPDATE EXISTING CATEGORIES
-- ============================================================================
-- Use this to modify existing categories

-- Example: Update a category's description
UPDATE equipment_categories
SET description = 'Electric drills, impact drivers, circular saws, and cordless power tools'
WHERE category_name = 'Power Tools';

-- Example: Update category icon
UPDATE equipment_categories
SET category_icon = '🔋'
WHERE category_name = 'Generators & Power';

-- ============================================================================
-- 6. DISABLE/ENABLE CATEGORIES
-- ============================================================================
-- Instead of deleting, disable categories that are no longer needed

-- Disable a category
UPDATE equipment_categories
SET is_active = FALSE
WHERE category_name = 'Old Category Name';

-- Enable a category
UPDATE equipment_categories
SET is_active = TRUE
WHERE category_name = 'Category Name';

-- ============================================================================
-- 7. CHECK IMPACT BEFORE DELETING CATEGORIES
-- ============================================================================
-- IMPORTANT: Before deleting a category, check if it's being used

-- Find equipment using a specific category
SELECT
    ei.equipment_id,
    ei.equipment_name,
    ei.is_available,
    ei.quantity_total
FROM equipment_inventory ei
JOIN equipment_categories ec ON ei.equipment_category_id = ec.equipment_category_id
WHERE ec.category_name = 'Category Name To Check';

-- Count equipment per category
SELECT
    ec.category_name,
    COUNT(ei.equipment_id) as equipment_count
FROM equipment_categories ec
LEFT JOIN equipment_inventory ei ON ec.equipment_category_id = ei.equipment_category_id
GROUP BY ec.equipment_category_id, ec.category_name
HAVING equipment_count > 0
ORDER BY equipment_count DESC;

-- ============================================================================
-- 8. SAFE CATEGORY DELETION (WITH MIGRATION)
-- ============================================================================
-- If you must delete a category, first migrate existing equipment to another category

-- Step 1: Move all equipment from old category to new category
UPDATE equipment_inventory
SET equipment_category_id = (SELECT equipment_category_id FROM equipment_categories WHERE category_name = 'New Category')
WHERE equipment_category_id = (SELECT equipment_category_id FROM equipment_categories WHERE category_name = 'Old Category');

-- Step 2: Now you can safely delete the old category
DELETE FROM equipment_categories WHERE category_name = 'Old Category';

-- ============================================================================
-- 9. VIEW ALL TABLES AFFECTED BY EQUIPMENT CATEGORIES
-- ============================================================================
-- This shows you all database relationships with equipment categories

-- Tables directly referencing equipment_categories:
-- 1. equipment_inventory (equipment_category_id) - FOREIGN KEY

SELECT
    'equipment_inventory' as table_name,
    COUNT(*) as records_count
FROM equipment_inventory;

-- ============================================================================
-- 10. COMPLETE CATEGORY STATISTICS
-- ============================================================================
-- Run this to see detailed statistics about each equipment category

SELECT
    ec.equipment_category_id,
    ec.category_name,
    ec.category_icon,
    ec.is_active,
    COUNT(DISTINCT ei.equipment_id) as total_equipment_items,
    SUM(ei.quantity_total) as total_quantity,
    SUM(ei.quantity_available) as available_quantity,
    COUNT(DISTINCT eb.equipment_booking_id) as total_bookings,
    AVG(ei.rental_price_per_day) as avg_rental_price,
    MIN(ei.created_at) as first_equipment_added,
    MAX(ei.created_at) as latest_equipment_added
FROM equipment_categories ec
LEFT JOIN equipment_inventory ei ON ec.equipment_category_id = ei.equipment_category_id
LEFT JOIN equipment_bookings eb ON ei.equipment_id = eb.equipment_id
GROUP BY ec.equipment_category_id, ec.category_name, ec.category_icon, ec.is_active
ORDER BY total_equipment_items DESC;

-- ============================================================================
-- 11. POPULAR EQUIPMENT CATEGORIES (BY RENTALS)
-- ============================================================================
-- Find which categories are most rented

SELECT
    ec.category_name,
    ec.category_icon,
    COUNT(DISTINCT eb.equipment_booking_id) as total_rentals,
    SUM(eb.total_cost) as total_revenue,
    AVG(eb.total_cost) as avg_booking_value
FROM equipment_categories ec
JOIN equipment_inventory ei ON ec.equipment_category_id = ei.equipment_category_id
JOIN equipment_bookings eb ON ei.equipment_id = eb.equipment_id
WHERE eb.booking_status IN ('rented_out', 'returned')
GROUP BY ec.equipment_category_id, ec.category_name, ec.category_icon
ORDER BY total_rentals DESC
LIMIT 10;

-- ============================================================================
-- 12. EQUIPMENT AVAILABILITY BY CATEGORY
-- ============================================================================
-- See which categories have available equipment

SELECT
    ec.category_name,
    ec.category_icon,
    COUNT(ei.equipment_id) as total_items,
    SUM(ei.quantity_total) as total_quantity,
    SUM(ei.quantity_available) as available_quantity,
    ROUND((SUM(ei.quantity_available) / SUM(ei.quantity_total)) * 100, 2) as availability_percentage
FROM equipment_categories ec
LEFT JOIN equipment_inventory ei ON ec.equipment_category_id = ei.equipment_category_id
WHERE ec.is_active = TRUE
GROUP BY ec.equipment_category_id, ec.category_name, ec.category_icon
ORDER BY availability_percentage DESC;

-- ============================================================================
-- 13. VERIFY CATEGORY SETUP
-- ============================================================================
-- Run this final check to ensure everything is working

-- Check for categories without icons
SELECT equipment_category_id, category_name, 'Missing icon' as issue
FROM equipment_categories
WHERE category_icon IS NULL OR category_icon = '';

-- Check for categories with no description
SELECT equipment_category_id, category_name, 'Missing description' as issue
FROM equipment_categories
WHERE description IS NULL OR description = '';

-- Check for inactive categories still being used
SELECT
    ec.category_name,
    COUNT(ei.equipment_id) as equipment_count,
    'Category is inactive but has equipment' as issue
FROM equipment_categories ec
JOIN equipment_inventory ei ON ec.equipment_category_id = ei.equipment_category_id
WHERE ec.is_active = FALSE
GROUP BY ec.equipment_category_id, ec.category_name;

-- Check for empty categories (no equipment)
SELECT
    ec.category_name,
    ec.is_active,
    'No equipment in this category' as issue
FROM equipment_categories ec
LEFT JOIN equipment_inventory ei ON ec.equipment_category_id = ei.equipment_category_id
WHERE ei.equipment_id IS NULL
ORDER BY ec.category_name;

-- ============================================================================
-- 14. EXAMPLE: ADD EQUIPMENT TO A CATEGORY
-- ============================================================================
-- This shows how equipment is linked to categories

-- Example: Add a drill to Power Tools category
-- (This is just for reference - normally done via the application)
/*
INSERT INTO equipment_inventory (
    supplier_id,
    equipment_category_id,
    equipment_name,
    equipment_description,
    equipment_condition,
    rental_price_per_day,
    quantity_total,
    quantity_available,
    is_available
) VALUES (
    1,  -- Supplier ID
    (SELECT equipment_category_id FROM equipment_categories WHERE category_name = 'Power Tools'),
    'Makita 18V Cordless Drill',
    'Professional cordless drill with 2 batteries and charger',
    'excellent',
    1500.00,
    5000.00,
    3,
    3,
    TRUE
);
*/

-- ============================================================================
-- 15. CATEGORY USAGE REPORT
-- ============================================================================
-- Generate a comprehensive report on category usage

SELECT
    ec.category_name,
    ec.category_icon,
    COUNT(DISTINCT ei.equipment_id) as equipment_items,
    SUM(ei.quantity_total) as total_units,
    SUM(ei.quantity_available) as available_units,
    COUNT(DISTINCT eb.equipment_booking_id) as total_bookings,
    COUNT(DISTINCT CASE WHEN eb.booking_status = 'rented_out' THEN eb.equipment_booking_id END) as active_rentals,
    SUM(CASE WHEN eb.booking_status IN ('rented_out', 'returned') THEN eb.total_cost ELSE 0 END) as total_revenue,
    AVG(ei.rental_price_per_day) as avg_daily_rate,
    ec.is_active as is_active_category
FROM equipment_categories ec
LEFT JOIN equipment_inventory ei ON ec.equipment_category_id = ei.equipment_category_id
LEFT JOIN equipment_bookings eb ON ei.equipment_id = eb.equipment_id
GROUP BY ec.equipment_category_id, ec.category_name, ec.category_icon, ec.is_active
ORDER BY total_revenue DESC;

-- ============================================================================
-- END OF EQUIPMENT CATEGORY MANAGEMENT
-- ============================================================================

-- Summary: After running this script:
-- 1. You can view all existing equipment categories
-- 2. You can add new categories (20 default + 10 specialized = 30 total)
-- 3. You can safely update or disable categories
-- 4. You understand the impact on related tables (equipment_inventory, equipment_bookings)
-- 5. The system already has category support in the Java backend and React frontend
-- 6. Categories help organize equipment rentals and improve user experience

