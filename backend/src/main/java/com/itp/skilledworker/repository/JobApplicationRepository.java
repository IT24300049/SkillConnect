package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJob_JobId(Integer jobId);

    List<JobApplication> findByWorkerUser_UserId(Integer userId);

    boolean existsByJob_JobIdAndWorkerUser_UserId(Integer jobId, Integer userId);
}
