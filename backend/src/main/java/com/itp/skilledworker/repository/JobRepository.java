package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.Job;
import com.itp.skilledworker.entity.Job.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Integer> {
    List<Job> findByJobStatus(JobStatus status);

    List<Job> findByDistrict(String district);

    List<Job> findByJobStatusAndDistrict(JobStatus status, String district);

    List<Job> findByCustomer_CustomerId(Integer customerId);

    @Query("SELECT j FROM Job j WHERE j.jobStatus = 'active' AND (:district IS NULL OR j.district = :district) AND (:categoryId IS NULL OR j.category.categoryId = :categoryId)")
    List<Job> findActiveJobsWithFilters(String district, Integer categoryId);

    @Query("SELECT DISTINCT j FROM Job j WHERE j.customer.user.userId = :customerUserId AND EXISTS (SELECT 1 FROM JobApplication a WHERE a.job = j AND a.status = 'accepted')")
    List<Job> findJobsWithWorkerAcceptance(@Param("customerUserId") Integer customerUserId);
}
