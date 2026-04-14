package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.WorkerAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface WorkerAvailabilityRepository extends JpaRepository<WorkerAvailability, Long> {
    List<WorkerAvailability> findByWorker_WorkerId(Integer workerId);

    List<WorkerAvailability> findByWorker_WorkerIdAndAvailableDateGreaterThanEqual(Integer workerId, LocalDate date);

    List<WorkerAvailability> findByWorker_WorkerIdAndAvailableDate(Integer workerId, LocalDate date);

    Optional<WorkerAvailability> findFirstByWorker_WorkerIdAndAvailableDateAndStartTimeAndEndTime(
        Integer workerId,
        LocalDate availableDate,
        LocalTime startTime,
        LocalTime endTime);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM WorkerAvailability a " +
        "WHERE a.worker.workerId = :workerId " +
        "AND a.availableDate = :date " +
        "AND a.isAvailable = true " +
        "AND a.startTime <= :time " +
        "AND a.endTime > :time")
    boolean existsAvailableSlot(
        @Param("workerId") Integer workerId,
        @Param("date") LocalDate date,
        @Param("time") LocalTime time);
}
