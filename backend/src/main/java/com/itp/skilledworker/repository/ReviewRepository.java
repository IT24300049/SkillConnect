package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByReviewee_UserId(Integer revieweeId);

    List<Review> findByReviewer_UserId(Integer reviewerId);

    boolean existsByBooking_BookingIdAndReviewer_UserId(Integer bookingId, Integer reviewerId);
}
