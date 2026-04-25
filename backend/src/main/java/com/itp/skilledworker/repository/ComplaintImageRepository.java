package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.ComplaintImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintImageRepository extends JpaRepository<ComplaintImage, Integer> {
    List<ComplaintImage> findByComplaint_ComplaintIdOrderBySortOrderAsc(Integer complaintId);
}
