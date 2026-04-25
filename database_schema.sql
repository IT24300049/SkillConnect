-- ============================================================================
-- ON-DEMAND SKILLED WORKER BOOKING SYSTEM - DATABASE SCHEMA
-- IT2150 Assignment 2 - Week 6
-- Group: ITP_SE_01
-- 5 Members with Tool & Equipment Rental Management
-- ============================================================================

-- Drop existing database if exists
DROP DATABASE IF EXISTS skilled_worker_booking;
CREATE DATABASE skilled_worker_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skilled_worker_booking;

-- ============================================================================
-- MEMBER 1: USER MANAGEMENT & AUTHENTICATION SYSTEM
-- ============================================================================

-- Core User Table (All roles)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'worker', 'supplier', 'admin') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- Password Recovery Table (NEW - Assignment 2 Requirement)
CREATE TABLE password_recovery (
    recovery_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recovery_token VARCHAR(255) NOT NULL UNIQUE,
    token_expiry TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_token (recovery_token),
    INDEX idx_expiry (token_expiry)
) ENGINE=InnoDB;

-- Email Verification Table
CREATE TABLE email_verification (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    verification_token VARCHAR(255) NOT NULL UNIQUE,
    token_expiry TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_token (verification_token)
) ENGINE=InnoDB;

-- Customer Profile
CREATE TABLE customer_profiles (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(20),
    profile_picture VARCHAR(255),
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_district (district),
    INDEX idx_city (city)
) ENGINE=InnoDB;

-- Worker Profile
CREATE TABLE worker_profiles (
    worker_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nic_number VARCHAR(20) UNIQUE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(20),
    profile_picture VARCHAR(255),
    bio TEXT,
    hourly_rate_min DECIMAL(10, 2),
    hourly_rate_max DECIMAL(10, 2),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP NULL,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    total_jobs INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_district (district),
    INDEX idx_city (city),
    INDEX idx_is_verified (is_verified)
) ENGINE=InnoDB;

-- Skills Master Table
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    skill_category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Worker Skills (Many-to-Many)
CREATE TABLE worker_skills (
    worker_skill_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'expert') DEFAULT 'intermediate',
    years_experience INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_skill (worker_id, skill_id)
) ENGINE=InnoDB;

-- Worker Documents
CREATE TABLE worker_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    document_type ENUM('nic', 'license', 'certificate', 'police_clearance', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verified_by INT NULL,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_verification_status (verification_status)
) ENGINE=InnoDB;

-- Worker Portfolio
CREATE TABLE worker_portfolio (
    portfolio_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT,
    project_date DATE,
    image_path VARCHAR(500),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Worker Availability
CREATE TABLE worker_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_day (worker_id, day_of_week)
) ENGINE=InnoDB;

-- Worker Service Areas
CREATE TABLE worker_service_areas (
    service_area_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    max_distance_km INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    INDEX idx_district (district)
) ENGINE=InnoDB;

-- User Sessions (JWT tracking)
CREATE TABLE user_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    jwt_token VARCHAR(500) NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_jwt_token (jwt_token(255)),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- ============================================================================
-- MEMBER 2: JOB POSTING MANAGEMENT SYSTEM
-- ============================================================================

-- Job Categories
CREATE TABLE job_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_icon VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Job Subcategories
CREATE TABLE job_subcategories (
    subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    subcategory_name VARCHAR(100) NOT NULL,
    description TEXT,
    estimated_duration_hours INT,
    estimated_cost_min DECIMAL(10, 2),
    estimated_cost_max DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES job_categories(category_id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_subcategory (category_id, subcategory_name)
) ENGINE=InnoDB;

-- Jobs (Posted by Customers)
CREATE TABLE jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    category_id INT NOT NULL,
    subcategory_id INT,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    urgency_level ENUM('emergency', 'urgent', 'standard', 'scheduled') DEFAULT 'standard',
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    preferred_start_date DATE,
    preferred_start_time TIME,
    job_status ENUM('draft', 'active', 'assigned', 'completed', 'cancelled', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES job_categories(category_id),
    FOREIGN KEY (subcategory_id) REFERENCES job_subcategories(subcategory_id),
    INDEX idx_job_status (job_status),
    INDEX idx_district (district),
    INDEX idx_urgency (urgency_level),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Job Attachments (Images)
CREATE TABLE job_attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    upload_order INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Job Drafts
CREATE TABLE job_drafts (
    draft_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    draft_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Job Views (Worker views job)
CREATE TABLE job_views (
    view_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_worker_view (job_id, worker_id, viewed_at)
) ENGINE=InnoDB;

-- ============================================================================
-- MEMBER 3: BOOKING MANAGEMENT & WORKFLOW SYSTEM
-- ============================================================================

-- Bookings
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    customer_id INT NOT NULL,
    booking_status ENUM('requested', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected') DEFAULT 'requested',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration_hours INT,
    final_cost DECIMAL(10, 2),
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_by INT,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (cancelled_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_booking_status (booking_status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_worker_id (worker_id),
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB;

-- Booking Status History
CREATE TABLE booking_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Booking Modifications (Rescheduling)
CREATE TABLE booking_modifications (
    modification_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    modified_by INT NOT NULL,
    old_date DATE,
    new_date DATE,
    old_time TIME,
    new_time TIME,
    modification_reason TEXT,
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (modified_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Booking Cancellations
CREATE TABLE booking_cancellations (
    cancellation_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    cancelled_by INT NOT NULL,
    cancellation_reason TEXT NOT NULL,
    cancellation_type ENUM('customer_initiated', 'worker_initiated', 'admin_initiated') NOT NULL,
    refund_amount DECIMAL(10, 2),
    penalty_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (cancelled_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Booking Reminders
CREATE TABLE booking_reminders (
    reminder_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    recipient_user_id INT NOT NULL,
    reminder_type ENUM('24_hours_before', '2_hours_before', '30_mins_before', 'custom') NOT NULL,
    reminder_message TEXT,
    scheduled_time TIMESTAMP NOT NULL,
    sent_at TIMESTAMP NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_scheduled_time (scheduled_time),
    INDEX idx_is_sent (is_sent)
) ENGINE=InnoDB;

-- Booking Timeline (Activity Log)
CREATE TABLE booking_timeline (
    timeline_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Booking Conflicts (Prevent double booking)
CREATE TABLE booking_conflicts (
    conflict_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    booking_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_worker_date (worker_id, booking_date)
) ENGINE=InnoDB;

-- ============================================================================
-- MEMBER 4: COMPLAINT, FEEDBACK & REVIEW MANAGEMENT + ADMIN
-- ============================================================================

-- Reviews
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    job_id INT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    reviewer_type ENUM('customer', 'worker') NOT NULL,
    overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE SET NULL,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_reviewer (booking_id, reviewer_id)
) ENGINE=InnoDB;

-- Review Ratings (Multi-aspect)
CREATE TABLE review_ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    rating_aspect ENUM('quality', 'punctuality', 'professionalism', 'value_for_money', 'communication') NOT NULL,
    rating_value INT NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    UNIQUE KEY unique_review_aspect (review_id, rating_aspect)
) ENGINE=InnoDB;

-- Review Attachments
CREATE TABLE review_attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'video') NOT NULL,
    upload_order INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Review Responses
CREATE TABLE review_responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    responder_id INT NOT NULL,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    FOREIGN KEY (responder_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Trust Score (Calculated from reviews)
CREATE TABLE trust_scores (
    trust_score_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    total_score DECIMAL(5, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    quality_avg DECIMAL(3, 2) DEFAULT 0,
    punctuality_avg DECIMAL(3, 2) DEFAULT 0,
    professionalism_avg DECIMAL(3, 2) DEFAULT 0,
    value_avg DECIMAL(3, 2) DEFAULT 0,
    communication_avg DECIMAL(3, 2) DEFAULT 0,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Messages (In-app chat)
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_thread_id (thread_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Message Threads
CREATE TABLE message_threads (
    thread_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    participant1_id INT NOT NULL,
    participant2_id INT NOT NULL,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (participant1_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (participant2_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_participants (participant1_id, participant2_id, booking_id)
) ENGINE=InnoDB;

-- Message Attachments
CREATE TABLE message_attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type ENUM('booking', 'message', 'review', 'system', 'promotional') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Notification Preferences
CREATE TABLE notification_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    booking_updates BOOLEAN DEFAULT TRUE,
    message_alerts BOOLEAN DEFAULT TRUE,
    review_alerts BOOLEAN DEFAULT TRUE,
    promotional_emails BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Complaints
CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    complainant_id INT NOT NULL,
    complained_against_id INT,
    booking_id INT,
    review_id INT,
    complaint_category ENUM('service_quality', 'inappropriate_behavior', 'fraud', 'payment_issue', 'other') NOT NULL,
    complaint_title VARCHAR(255) NOT NULL,
    complaint_description TEXT NOT NULL,
    complaint_status ENUM('pending', 'investigating', 'resolved', 'rejected') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to INT,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (complainant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (complained_against_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_status (complaint_status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB;

-- Complaint images (1-3 per complaint)
CREATE TABLE complaint_images (
    complaint_image_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    sort_order TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    UNIQUE KEY uk_complaint_image_order (complaint_id, sort_order),
    INDEX idx_complaint_images_complaint_id (complaint_id)
) ENGINE=InnoDB;

-- Reports (Flagged content)
CREATE TABLE reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    reported_entity_type ENUM('review', 'message', 'user', 'job') NOT NULL,
    reported_entity_id INT NOT NULL,
    report_reason ENUM('spam', 'inappropriate', 'harassment', 'fake', 'other') NOT NULL,
    report_description TEXT,
    report_status ENUM('pending', 'reviewed', 'action_taken', 'dismissed') DEFAULT 'pending',
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_status (report_status)
) ENGINE=InnoDB;

-- Disputes
CREATE TABLE disputes (
    dispute_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    initiator_id INT NOT NULL,
    respondent_id INT NOT NULL,
    dispute_type ENUM('payment', 'service_quality', 'cancellation', 'other') NOT NULL,
    dispute_description TEXT NOT NULL,
    dispute_status ENUM('open', 'investigating', 'mediation', 'resolved', 'closed') DEFAULT 'open',
    assigned_admin_id INT,
    resolution_outcome TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (initiator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (respondent_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_admin_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_status (dispute_status)
) ENGINE=InnoDB;

-- User Warnings
CREATE TABLE user_warnings (
    warning_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    issued_by INT NOT NULL,
    warning_type ENUM('minor', 'major', 'final') NOT NULL,
    warning_reason TEXT NOT NULL,
    related_report_id INT,
    related_complaint_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (related_report_id) REFERENCES reports(report_id) ON DELETE SET NULL,
    FOREIGN KEY (related_complaint_id) REFERENCES complaints(complaint_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- User Suspensions
CREATE TABLE user_suspensions (
    suspension_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    suspended_by INT NOT NULL,
    suspension_reason TEXT NOT NULL,
    suspension_type ENUM('temporary', 'permanent') NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (suspended_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- Worker Verification Queue
CREATE TABLE worker_verification_queue (
    verification_queue_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    verification_status ENUM('pending', 'in_review', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    rejection_reason TEXT,
    priority INT DEFAULT 0,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_status (verification_status)
) ENGINE=InnoDB;

-- Moderation Actions Log
CREATE TABLE moderation_actions (
    action_id INT AUTO_INCREMENT PRIMARY KEY,
    moderator_id INT NOT NULL,
    action_type ENUM('suspend_user', 'approve_worker', 'reject_worker', 'delete_review', 'resolve_complaint', 'other') NOT NULL,
    target_entity_type VARCHAR(50),
    target_entity_id INT,
    action_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (moderator_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Platform Analytics
CREATE TABLE platform_analytics (
    analytics_id INT AUTO_INCREMENT PRIMARY KEY,
    metric_date DATE NOT NULL UNIQUE,
    total_users INT DEFAULT 0,
    total_customers INT DEFAULT 0,
    total_workers INT DEFAULT 0,
    total_suppliers INT DEFAULT 0,
    new_users_today INT DEFAULT 0,
    active_jobs INT DEFAULT 0,
    completed_bookings INT DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    average_booking_value DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================================
-- MEMBER 5: TOOL & EQUIPMENT RENTAL MANAGEMENT SYSTEM
-- ============================================================================

-- Supplier Profile
CREATE TABLE supplier_profiles (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(100),
    contact_person_name VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    business_logo VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP NULL,
    total_equipment_count INT DEFAULT 0,
    total_rentals INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_district (district),
    INDEX idx_is_verified (is_verified)
) ENGINE=InnoDB;

-- Supplier Documents
CREATE TABLE supplier_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    document_type ENUM('business_registration', 'nic', 'tax_certificate', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verified_by INT NULL,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (supplier_id) REFERENCES supplier_profiles(supplier_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_verification_status (verification_status)
) ENGINE=InnoDB;

-- Equipment Categories
CREATE TABLE equipment_categories (
    equipment_category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_icon VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Equipment Inventory
CREATE TABLE equipment_inventory (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    equipment_category_id INT NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_description TEXT,
    equipment_condition ENUM('new', 'excellent', 'good', 'fair') NOT NULL,
    rental_price_per_day DECIMAL(10, 2) NOT NULL,
    late_fee_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
    quantity_available INT NOT NULL DEFAULT 1,
    quantity_total INT NOT NULL DEFAULT 1,
    location_details VARCHAR(500),
    image_path VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES supplier_profiles(supplier_id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_category_id) REFERENCES equipment_categories(equipment_category_id),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_is_available (is_available)
) ENGINE=InnoDB;

-- Equipment Bookings
CREATE TABLE equipment_bookings (
    equipment_booking_id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    customer_id INT NOT NULL,
    supplier_id INT NOT NULL,
    booking_status ENUM('available', 'reserved', 'rented_out', 'returned', 'damaged', 'cancelled') DEFAULT 'reserved',
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    actual_return_date DATE NULL,
    quantity_rented INT DEFAULT 1,
    daily_rate DECIMAL(10, 2) NOT NULL,
    late_fee_per_day_snapshot DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_days INT NOT NULL,
    overdue_days INT NOT NULL DEFAULT 0,
    base_rental_cost DECIMAL(10, 2) NOT NULL,
    late_fee DECIMAL(10, 2) DEFAULT 0,
    damage_fee DECIMAL(10, 2) DEFAULT 0,
    total_cost DECIMAL(10, 2) NOT NULL,
    deposit_returned BOOLEAN DEFAULT FALSE,
    payment_status ENUM('pending', 'deposit_paid', 'fully_paid', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment_inventory(equipment_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES supplier_profiles(supplier_id) ON DELETE CASCADE,
    INDEX idx_booking_status (booking_status),
    INDEX idx_rental_dates (rental_start_date, rental_end_date),
    INDEX idx_customer_id (customer_id),
    INDEX idx_supplier_id (supplier_id)
) ENGINE=InnoDB;

-- Equipment Rental Late Fees (NEW - Assignment 2 Requirement)
CREATE TABLE equipment_late_fees (
    late_fee_id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_booking_id INT NOT NULL,
    days_overdue INT NOT NULL,
    daily_late_fee_rate DECIMAL(10, 2) NOT NULL,
    total_late_fee DECIMAL(10, 2) NOT NULL,
    fee_status ENUM('pending', 'paid', 'waived') DEFAULT 'pending',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (equipment_booking_id) REFERENCES equipment_bookings(equipment_booking_id) ON DELETE CASCADE,
    UNIQUE KEY uk_equipment_booking_id (equipment_booking_id),
    INDEX idx_fee_status (fee_status)
) ENGINE=InnoDB;

-- Equipment Availability Tracking
CREATE TABLE equipment_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    date DATE NOT NULL,
    quantity_available INT NOT NULL,
    quantity_reserved INT DEFAULT 0,
    quantity_rented INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment_inventory(equipment_id) ON DELETE CASCADE,
    UNIQUE KEY unique_equipment_date (equipment_id, date)
) ENGINE=InnoDB;

-- Equipment Reviews
CREATE TABLE equipment_reviews (
    equipment_review_id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_booking_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    condition_rating INT CHECK (condition_rating >= 1 AND condition_rating <= 5),
    value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_booking_id) REFERENCES equipment_bookings(equipment_booking_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_reviewer (equipment_booking_id, reviewer_id)
) ENGINE=InnoDB;

-- ============================================================================
-- ADMIN & SYSTEM CONFIGURATION
-- ============================================================================

-- System Settings
CREATE TABLE system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Admin Activity Log
CREATE TABLE admin_activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Security Log
CREATE TABLE security_log (
    security_log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_type ENUM('login_success', 'login_failed', 'password_reset', 'account_locked', 'suspicious_activity') NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    event_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- INITIAL DATA INSERTS
-- ============================================================================

-- Insert default skills
INSERT INTO skills (skill_name, skill_category) VALUES
('Electrical Work', 'Construction'),
('Plumbing', 'Construction'),
('Carpentry', 'Construction'),
('Painting', 'Construction'),
('AC Repair', 'Appliance Repair'),
('Refrigerator Repair', 'Appliance Repair'),
('Masonry', 'Construction'),
('Roofing', 'Construction'),
('Tiling', 'Construction'),
('Welding', 'Metal Work');

-- Insert default job categories
INSERT INTO job_categories (category_name, description) VALUES
('Electrical', 'All electrical work including wiring, repairs, and installations'),
('Plumbing', 'Plumbing services including pipe work, leak repairs, and installations'),
('Carpentry', 'Woodwork and furniture repairs'),
('Painting', 'Interior and exterior painting services'),
('Appliance Repair', 'Repair services for home appliances'),
('General Maintenance', 'General home and office maintenance'),
('Landscaping', 'Garden and outdoor maintenance'),
('Cleaning', 'Professional cleaning services');

-- Insert default equipment categories
INSERT INTO equipment_categories (category_name, description) VALUES
('Power Tools', 'Electric and battery-powered tools'),
('Hand Tools', 'Manual tools and equipment'),
('Ladders & Scaffolding', 'Access equipment'),
('Concrete & Masonry Tools', 'Construction equipment'),
('Gardening Tools', 'Lawn and garden equipment'),
('Safety Equipment', 'Personal protective equipment');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('booking_cancellation_hours', '24', 'integer', 'Minimum hours before booking to allow free cancellation'),
('late_fee_percentage', '10', 'integer', 'Percentage of daily rate charged as late fee'),
('platform_commission_rate', '15', 'integer', 'Platform commission percentage on bookings'),
('max_booking_advance_days', '90', 'integer', 'Maximum days in advance a booking can be made'),
('password_reset_token_expiry_hours', '24', 'integer', 'Password reset token validity in hours'),
('email_verification_expiry_hours', '72', 'integer', 'Email verification token validity in hours');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Available Workers View
CREATE VIEW available_workers AS
SELECT 
    wp.worker_id,
    u.email,
    wp.first_name,
    wp.last_name,
    wp.city,
    wp.district,
    wp.hourly_rate_min,
    wp.hourly_rate_max,
    wp.average_rating,
    wp.total_jobs,
    wp.is_verified,
    GROUP_CONCAT(DISTINCT s.skill_name SEPARATOR ', ') as skills
FROM worker_profiles wp
JOIN users u ON wp.user_id = u.user_id
LEFT JOIN worker_skills ws ON wp.worker_id = ws.worker_id
LEFT JOIN skills s ON ws.skill_id = s.skill_id
WHERE u.is_active = TRUE AND wp.is_verified = TRUE
GROUP BY wp.worker_id;

-- Active Jobs View
CREATE VIEW active_jobs_view AS
SELECT 
    j.job_id,
    j.job_title,
    j.job_description,
    j.city,
    j.district,
    j.urgency_level,
    j.budget_min,
    j.budget_max,
    j.created_at,
    cp.first_name as customer_first_name,
    cp.last_name as customer_last_name,
    jc.category_name,
    jsc.subcategory_name
FROM jobs j
JOIN customer_profiles cp ON j.customer_id = cp.customer_id
JOIN job_categories jc ON j.category_id = jc.category_id
LEFT JOIN job_subcategories jsc ON j.subcategory_id = jsc.subcategory_id
WHERE j.job_status = 'active';

-- Equipment Availability View
CREATE VIEW equipment_availability_view AS
SELECT 
    ei.equipment_id,
    ei.equipment_name,
    ei.rental_price_per_day,
    ei.quantity_available,
    ei.quantity_total,
    sp.business_name as supplier_name,
    sp.city,
    sp.district,
    ec.category_name
FROM equipment_inventory ei
JOIN supplier_profiles sp ON ei.supplier_id = sp.supplier_id
JOIN equipment_categories ec ON ei.equipment_category_id = ec.equipment_category_id
WHERE ei.is_available = TRUE AND ei.quantity_available > 0;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

DELIMITER //

-- Calculate Late Fee for Equipment Rental
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

-- Update Worker Trust Score
CREATE PROCEDURE update_worker_trust_score(IN worker_user_id INT)
BEGIN
    DECLARE avg_quality DECIMAL(3, 2);
    DECLARE avg_punctuality DECIMAL(3, 2);
    DECLARE avg_professionalism DECIMAL(3, 2);
    DECLARE avg_value DECIMAL(3, 2);
    DECLARE avg_communication DECIMAL(3, 2);
    DECLARE overall_score DECIMAL(5, 2);
    DECLARE review_count INT;
    
    -- Calculate averages
    SELECT 
        AVG(CASE WHEN rr.rating_aspect = 'quality' THEN rr.rating_value END),
        AVG(CASE WHEN rr.rating_aspect = 'punctuality' THEN rr.rating_value END),
        AVG(CASE WHEN rr.rating_aspect = 'professionalism' THEN rr.rating_value END),
        AVG(CASE WHEN rr.rating_aspect = 'value_for_money' THEN rr.rating_value END),
        AVG(CASE WHEN rr.rating_aspect = 'communication' THEN rr.rating_value END),
        COUNT(DISTINCT r.review_id)
    INTO avg_quality, avg_punctuality, avg_professionalism, avg_value, avg_communication, review_count
    FROM reviews r
    JOIN review_ratings rr ON r.review_id = rr.review_id
    WHERE r.reviewee_id = worker_user_id;
    
    -- Calculate overall score (average of all aspects)
    SET overall_score = (COALESCE(avg_quality, 0) + COALESCE(avg_punctuality, 0) + 
                        COALESCE(avg_professionalism, 0) + COALESCE(avg_value, 0) + 
                        COALESCE(avg_communication, 0)) / 5;
    
    -- Insert or update trust score
    INSERT INTO trust_scores (
        user_id, total_score, total_reviews, quality_avg, punctuality_avg,
        professionalism_avg, value_avg, communication_avg
    ) VALUES (
        worker_user_id, overall_score, review_count, avg_quality, avg_punctuality,
        avg_professionalism, avg_value, avg_communication
    )
    ON DUPLICATE KEY UPDATE
        total_score = overall_score,
        total_reviews = review_count,
        quality_avg = avg_quality,
        punctuality_avg = avg_punctuality,
        professionalism_avg = avg_professionalism,
        value_avg = avg_value,
        communication_avg = avg_communication,
        last_calculated = CURRENT_TIMESTAMP;
    
    -- Update worker profile average rating
    UPDATE worker_profiles
    SET average_rating = overall_score
    WHERE user_id = worker_user_id;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DELIMITER //

-- Auto-calculate total cost for equipment booking
CREATE TRIGGER calculate_equipment_booking_cost
BEFORE INSERT ON equipment_bookings
FOR EACH ROW
BEGIN
    SET NEW.total_days = DATEDIFF(NEW.rental_end_date, NEW.rental_start_date);
    SET NEW.base_rental_cost = NEW.daily_rate * NEW.total_days * COALESCE(NEW.quantity_rented, 1);
    SET NEW.total_cost = NEW.base_rental_cost + COALESCE(NEW.late_fee, 0) + COALESCE(NEW.damage_fee, 0);
END //

-- Update equipment availability after booking
CREATE TRIGGER update_equipment_availability_after_booking
AFTER INSERT ON equipment_bookings
FOR EACH ROW
BEGIN
    UPDATE equipment_inventory
    SET quantity_available = quantity_available - NEW.quantity_rented
    WHERE equipment_id = NEW.equipment_id;
END //

-- Restore equipment availability after return
CREATE TRIGGER restore_equipment_availability_after_return
AFTER UPDATE ON equipment_bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'returned' AND OLD.booking_status != 'returned' THEN
        UPDATE equipment_inventory
        SET quantity_available = quantity_available + NEW.quantity_rented
        WHERE equipment_id = NEW.equipment_id;
    END IF;
END //

-- Update worker total jobs count
CREATE TRIGGER update_worker_job_count
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'completed' AND OLD.booking_status != 'completed' THEN
        UPDATE worker_profiles
        SET total_jobs = total_jobs + 1
        WHERE worker_id = NEW.worker_id;
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_jobs_district_status ON jobs(district, job_status);
CREATE INDEX idx_bookings_worker_status ON bookings(worker_id, booking_status);
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, booking_status);
CREATE INDEX idx_equipment_supplier_available ON equipment_inventory(supplier_id, is_available);
CREATE INDEX idx_reviews_reviewee_rating ON reviews(reviewee_id, overall_rating);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Display table count
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'skilled_worker_booking';
