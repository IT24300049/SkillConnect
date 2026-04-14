package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);

    long countByUser_UserIdAndIsReadFalse(Integer userId);
}
