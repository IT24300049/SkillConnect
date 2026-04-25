-- Complaint images migration
-- Run this against your active database (example: skilled_worker_booking)

CREATE TABLE IF NOT EXISTS complaint_images (
    complaint_image_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    sort_order TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    UNIQUE KEY uk_complaint_image_order (complaint_id, sort_order),
    INDEX idx_complaint_images_complaint_id (complaint_id)
) ENGINE=InnoDB;
