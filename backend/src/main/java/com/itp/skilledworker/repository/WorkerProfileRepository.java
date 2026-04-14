package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Integer> {
    Optional<WorkerProfile> findByUser_UserId(Integer userId);

    List<WorkerProfile> findByDistrict(String district);

    List<WorkerProfile> findByIsVerified(Boolean isVerified);

    List<WorkerProfile> findBySkillCategoryIgnoreCase(String skillCategory);

    List<WorkerProfile> findByDistrictAndSkillCategoryIgnoreCase(String district, String skillCategory);
}
