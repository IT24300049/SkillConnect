-- ============================================================================
-- JOB CATEGORIES MANAGEMENT FOR SKILLED WORKER BOOKING SYSTEM
-- ============================================================================
-- This file shows the current job categories setup and how to add/modify them
-- ============================================================================

USE skilled_worker_booking;

-- ============================================================================
-- 1. VIEW CURRENT JOB CATEGORIES
-- ============================================================================
-- Run this to see what categories already exist
SELECT
    category_id,
    category_name,
    description,
    is_active,
    created_at
FROM job_categories
ORDER BY category_name;

-- ============================================================================
-- 2. VIEW JOBS BY CATEGORY
-- ============================================================================
-- This shows how categories are being used in the jobs table
SELECT
    jc.category_name,
    COUNT(j.job_id) as total_jobs,
    COUNT(CASE WHEN j.job_status = 'active' THEN 1 END) as active_jobs,
    COUNT(CASE WHEN j.job_status = 'completed' THEN 1 END) as completed_jobs
FROM job_categories jc
LEFT JOIN jobs j ON jc.category_id = j.category_id
GROUP BY jc.category_id, jc.category_name
ORDER BY total_jobs DESC;

-- ============================================================================
-- 3. ADD NEW CATEGORIES
-- ============================================================================
-- Use this to add new job categories to your system

-- Example: Add new categories
INSERT INTO job_categories (category_name, description, is_active) VALUES
('Roofing', 'Roof repair, installation, and waterproofing services', TRUE),
('HVAC', 'Heating, ventilation, and air conditioning services', TRUE),
('Flooring', 'Floor installation, repair, and polishing services', TRUE),
('Pest Control', 'Professional pest control and fumigation services', TRUE),
('Handyman', 'General repair and maintenance services', TRUE),
('Moving & Hauling', 'Moving, packing, and transportation services', TRUE),
('Security Systems', 'Security camera installation and alarm systems', TRUE),
('Interior Design', 'Home and office interior design consultation', TRUE)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    is_active = VALUES(is_active);

-- ============================================================================
-- 4. UPDATE EXISTING CATEGORIES
-- ============================================================================
-- Use this to modify existing categories

-- Example: Update a category's description
UPDATE job_categories
SET description = 'Complete electrical services including wiring, repairs, installations, and safety inspections'
WHERE category_name = 'Electrical';

-- Example: Add icon to categories
UPDATE job_categories SET category_icon = '⚡' WHERE category_name = 'Electrical';
UPDATE job_categories SET category_icon = '🔧' WHERE category_name = 'Plumbing';
UPDATE job_categories SET category_icon = '🪚' WHERE category_name = 'Carpentry';
UPDATE job_categories SET category_icon = '🎨' WHERE category_name = 'Painting';
UPDATE job_categories SET category_icon = '🔌' WHERE category_name = 'Appliance Repair';
UPDATE job_categories SET category_icon = '🛠️' WHERE category_name = 'General Maintenance';
UPDATE job_categories SET category_icon = '🌳' WHERE category_name = 'Landscaping';
UPDATE job_categories SET category_icon = '🧹' WHERE category_name = 'Cleaning';

-- ============================================================================
-- 5. DISABLE/ENABLE CATEGORIES
-- ============================================================================
-- Instead of deleting, disable categories that are no longer needed

-- Disable a category
UPDATE job_categories
SET is_active = FALSE
WHERE category_name = 'Old Category Name';

-- Enable a category
UPDATE job_categories
SET is_active = TRUE
WHERE category_name = 'Category Name';

-- ============================================================================
-- 6. CHECK IMPACT BEFORE DELETING CATEGORIES
-- ============================================================================
-- IMPORTANT: Before deleting a category, check if it's being used

-- Find jobs using a specific category
SELECT
    j.job_id,
    j.job_title,
    j.job_status,
    j.created_at
FROM jobs j
JOIN job_categories jc ON j.category_id = jc.category_id
WHERE jc.category_name = 'Category Name To Check';

-- Find subcategories under a category
SELECT
    subcategory_id,
    subcategory_name,
    description
FROM job_subcategories
WHERE category_id = (SELECT category_id FROM job_categories WHERE category_name = 'Category Name');

-- ============================================================================
-- 7. SAFE CATEGORY DELETION (WITH MIGRATION)
-- ============================================================================
-- If you must delete a category, first migrate existing jobs to another category

-- Step 1: Create a new "Archived Jobs" category (if needed)
INSERT INTO job_categories (category_name, description, is_active)
VALUES ('Archived', 'Jobs from deprecated categories', FALSE)
ON DUPLICATE KEY UPDATE category_id = category_id;

-- Step 2: Move all jobs from old category to new category
UPDATE jobs
SET category_id = (SELECT category_id FROM job_categories WHERE category_name = 'New Category')
WHERE category_id = (SELECT category_id FROM job_categories WHERE category_name = 'Old Category');

-- Step 3: Now you can safely delete the old category
DELETE FROM job_categories WHERE category_name = 'Old Category';

-- ============================================================================
-- 8. VIEW ALL TABLES AFFECTED BY CATEGORIES
-- ============================================================================
-- This shows you all database relationships with categories

-- Tables directly referencing job_categories:
-- 1. jobs (category_id) - FOREIGN KEY
-- 2. job_subcategories (category_id) - FOREIGN KEY

SELECT
    'jobs' as table_name,
    COUNT(*) as records_count
FROM jobs
UNION ALL
SELECT
    'job_subcategories' as table_name,
    COUNT(*) as records_count
FROM job_subcategories;

-- ============================================================================
-- 9. COMPLETE CATEGORY STATISTICS
-- ============================================================================
-- Run this to see detailed statistics about each category

SELECT
    jc.category_id,
    jc.category_name,
    jc.category_icon,
    jc.is_active,
    COUNT(DISTINCT j.job_id) as total_jobs,
    COUNT(DISTINCT CASE WHEN j.job_status = 'active' THEN j.job_id END) as active_jobs,
    COUNT(DISTINCT CASE WHEN j.job_status = 'completed' THEN j.job_id END) as completed_jobs,
    COUNT(DISTINCT jsc.subcategory_id) as subcategories_count,
    MIN(j.created_at) as first_job_date,
    MAX(j.created_at) as latest_job_date
FROM job_categories jc
LEFT JOIN jobs j ON jc.category_id = j.category_id
LEFT JOIN job_subcategories jsc ON jc.category_id = jsc.category_id
GROUP BY jc.category_id, jc.category_name, jc.category_icon, jc.is_active
ORDER BY total_jobs DESC;

-- ============================================================================
-- 10. RECOMMENDED NEW CATEGORIES FOR SRI LANKA
-- ============================================================================
-- These are common service categories you might want to add

INSERT INTO job_categories (category_name, description, category_icon, is_active) VALUES
('Tiling & Masonry', 'Floor and wall tiling, masonry work', '🧱', TRUE),
('Welding & Metal Work', 'Metal fabrication and welding services', '⚒️', TRUE),
('Window & Door Installation', 'Window, door, and grille installation', '🚪', TRUE),
('Water Tank Cleaning', 'Water tank and sump cleaning services', '💧', TRUE),
('Solar Installation', 'Solar panel installation and maintenance', '☀️', TRUE),
('Generator Repair', 'Generator maintenance and repair', '⚙️', TRUE),
('Satellite & TV Installation', 'TV mounting and satellite dish installation', '📡', TRUE),
('Pool Maintenance', 'Swimming pool cleaning and maintenance', '🏊', TRUE),
('Gutter Cleaning', 'Roof gutter cleaning and repair', '🏠', TRUE),
('Fence Installation', 'Fence and gate installation services', '🔒', TRUE)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    category_icon = VALUES(category_icon),
    is_active = VALUES(is_active);

-- ============================================================================
-- 11. VERIFY CATEGORY SETUP
-- ============================================================================
-- Run this final check to ensure everything is working

-- Check for categories without icons
SELECT category_id, category_name, 'Missing icon' as issue
FROM job_categories
WHERE category_icon IS NULL OR category_icon = '';

-- Check for categories with no description
SELECT category_id, category_name, 'Missing description' as issue
FROM job_categories
WHERE description IS NULL OR description = '';

-- Check for inactive categories still being used
SELECT
    jc.category_name,
    COUNT(j.job_id) as active_jobs_count,
    'Category is inactive but has active jobs' as issue
FROM job_categories jc
JOIN jobs j ON jc.category_id = j.category_id
WHERE jc.is_active = FALSE AND j.job_status = 'active'
GROUP BY jc.category_id, jc.category_name;

-- ============================================================================
-- END OF CATEGORY MANAGEMENT
-- ============================================================================

-- Summary: After running this script:
-- 1. You can view all existing categories
-- 2. You can add new categories
-- 3. You can safely update or disable categories
-- 4. You understand the impact on related tables (jobs, job_subcategories)
-- 5. The system already has category support in the Java backend and React frontend

