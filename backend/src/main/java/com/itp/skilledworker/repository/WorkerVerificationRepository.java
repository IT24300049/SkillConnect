package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.WorkerVerification;
import com.itp.skilledworker.entity.WorkerVerification.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerVerificationRepository extends JpaRepository<WorkerVerification, Long> {

    Optional<WorkerVerification> findByWorker_WorkerId(Integer workerId);

    List<WorkerVerification> findByStatus(Status status);
}
