-- SKILLCONNECT DATABASE SCHEMA
-- Version: 1.0
-- Description: Complete schema definition including tables, constraints, and relationships.
-- 1. Job & Equipment Categories
CREATE TABLE job_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    category_icon VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE equipment_categories (
    equipment_category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    category_icon VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 2. User Management
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'worker', 'supplier', 'admin') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME
);
-- 3. Profiles
CREATE TABLE customer_profiles (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(20),
    profile_picture VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE worker_profiles (
    worker_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(100),
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
    verification_date DATETIME,
    total_earnings DECIMAL(15, 2) DEFAULT 0.00,
    total_jobs INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE supplier_profiles (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(100),
    contact_person_name VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    total_equipment_count INT DEFAULT 0,
    total_rentals INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- 4. Jobs & Applications
CREATE TABLE jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    category_id INT NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    urgency_level ENUM('emergency', 'urgent', 'standard', 'scheduled') DEFAULT 'standard',
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    preferred_start_date DATE,
    job_status ENUM(
        'draft',
        'active',
        'assigned',
        'completed',
        'cancelled',
        'expired'
    ) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id),
    FOREIGN KEY (category_id) REFERENCES job_categories(category_id)
);
CREATE TABLE job_applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    bid_amount DECIMAL(12, 2),
    proposal TEXT,
    application_status ENUM(
        'pending',
        'shortlisted',
        'accepted',
        'rejected',
        'withdrawn'
    ) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id)
);
-- 5. Bookings
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NULL,
    worker_id INT NOT NULL,
    customer_id INT NOT NULL,
    booking_status ENUM(
        'requested',
        'accepted',
        'in_progress',
        'completed',
        'cancelled',
        'rejected'
    ) DEFAULT 'requested',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration_hours INT,
    final_cost DECIMAL(12, 2),
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id),
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id),
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id)
);
-- 6. Equipment Rental
CREATE TABLE equipment_inventory (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    equipment_category_id INT NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_description TEXT,
    equipment_condition ENUM('new_', 'excellent', 'good', 'fair') NOT NULL,
    rental_price_per_day DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    quantity_available INT DEFAULT 1,
    quantity_total INT DEFAULT 1,
    image_path VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES supplier_profiles(supplier_id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_category_id) REFERENCES equipment_categories(equipment_category_id)
);
CREATE TABLE equipment_bookings (
    equipment_booking_id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    customer_id INT NOT NULL,
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_cost DECIMAL(12, 2),
    deposit_held DECIMAL(12, 2),
    booking_status ENUM(
        'pending',
        'reserved',
        'rented_out',
        'returned',
        'damaged',
        'cancelled'
    ) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment_inventory(equipment_id),
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id)
);
-- 7. Messaging & Social
CREATE TABLE message_threads (
    thread_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    participant1_id INT NOT NULL,
    participant2_id INT NOT NULL,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (participant1_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (participant2_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_participants (participant1_id, participant2_id, booking_id)
);
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES message_threads(thread_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    job_id INT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (
        rating BETWEEN 1 AND 5
    ),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id),
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id),
    UNIQUE KEY unique_booking_reviewer (booking_id, reviewer_id)
);
CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_user_id INT,
    job_id INT,
    review_id INT,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    complaint_status ENUM(
        'pending',
        'under_investigation',
        'resolved',
        'closed'
    ) DEFAULT 'pending',
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (target_user_id) REFERENCES users(user_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
    FOREIGN KEY (review_id) REFERENCES reviews(review_id)
);