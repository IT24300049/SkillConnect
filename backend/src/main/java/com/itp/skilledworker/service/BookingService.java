package com.itp.skilledworker.service;

import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final JobRepository jobRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerAvailabilityRepository workerAvailabilityRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Booking createBooking(Integer jobId, Integer workerId, Integer customerUserId,
            String scheduledDate, String scheduledTime, String notes) {
        // job is optional – customers can book workers directly
        Job job = null;
        if (jobId != null) {
            job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
        }
        WorkerProfile worker = workerProfileRepository.findById(workerId)
            .orElseThrow(() -> new RuntimeException("Worker not found"));
        if (!Boolean.TRUE.equals(worker.getIsVerified())) {
            throw new RuntimeException("Worker is not verified and cannot be booked yet.");
        }
        CustomerProfile customer = customerProfileRepository.findByUser_UserId(customerUserId)
                .orElseThrow(
                        () -> new RuntimeException("Customer profile not found. Please complete your profile first."));

        LocalDate date = LocalDate.parse(scheduledDate);
        LocalTime time = LocalTime.parse(scheduledTime);

        // If the worker has configured availability entries for this date,
        // enforce that the requested time falls inside at least one
        // explicitly available window. If they have not configured anything
        // for this date, treat the worker as available by default.
        boolean workerAvailableAtTime = true;
        List<WorkerAvailability> dayAvailability = workerAvailabilityRepository
                .findByWorker_WorkerIdAndAvailableDate(worker.getWorkerId(), date);
        if (!dayAvailability.isEmpty()) {
            workerAvailableAtTime = workerAvailabilityRepository
                    .existsAvailableSlot(worker.getWorkerId(), date, time);
        }
        if (!workerAvailableAtTime) {
            throw new RuntimeException("Worker is not available at the selected date/time slot.");
        }

        List<Booking> slotConflicts = bookingRepository.findByWorker_WorkerIdAndScheduledDateAndScheduledTimeAndBookingStatusIn(
            worker.getWorkerId(),
            date,
            time,
            List.of(Booking.BookingStatus.requested, Booking.BookingStatus.accepted, Booking.BookingStatus.in_progress));
        if (!slotConflicts.isEmpty()) {
            throw new RuntimeException("Selected slot is already booked.");
        }

        Booking booking = new Booking();
        booking.setJob(job);
        booking.setWorker(worker);
        booking.setCustomer(customer);
        booking.setScheduledDate(date);
        booking.setScheduledTime(time);
        booking.setNotes(notes);
        booking.setBookingStatus(Booking.BookingStatus.requested);
        booking = bookingRepository.save(booking);

        logStatusChange(booking, null, Booking.BookingStatus.requested.name(), customer.getUser(), "Booking created");
        return booking;
    }

    public List<Booking> getBookingsForWorker(Integer workerUserId) {
        WorkerProfile worker = workerProfileRepository.findByUser_UserId(workerUserId)
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));
        return bookingRepository.findByWorker_WorkerId(worker.getWorkerId());
    }

    public List<Booking> getBookingsForCustomer(Integer customerUserId) {
        CustomerProfile customer = customerProfileRepository.findByUser_UserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        return bookingRepository.findByCustomer_CustomerId(customer.getCustomerId());
    }

    public Booking getBookingById(Integer bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Transactional
    public Booking updateBookingStatus(Integer bookingId, String newStatus, Integer actorUserId, String reason) {
        Booking booking = getBookingById(bookingId);
        User actor = userRepository.findById(actorUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking.BookingStatus oldStatus = booking.getBookingStatus();
        Booking.BookingStatus targetStatus = Booking.BookingStatus.valueOf(newStatus);

        validateTransition(oldStatus, targetStatus);

        booking.setBookingStatus(targetStatus);

        if (targetStatus == Booking.BookingStatus.cancelled) {
            booking.setCancellationReason(reason);
        }
        if (targetStatus == Booking.BookingStatus.completed) {
            booking.setCompletedAt(java.time.LocalDateTime.now());
        }

        booking = bookingRepository.save(booking);
        logStatusChange(booking, oldStatus.name(), targetStatus.name(), actor, reason);
        if (targetStatus == Booking.BookingStatus.completed) {
            sendReviewReminders(booking);
        }
        return booking;
    }

    private void validateTransition(Booking.BookingStatus from, Booking.BookingStatus to) {
        boolean valid = switch (from) {
            case requested -> to == Booking.BookingStatus.accepted || to == Booking.BookingStatus.rejected
                    || to == Booking.BookingStatus.cancelled;
            case accepted -> to == Booking.BookingStatus.in_progress || to == Booking.BookingStatus.cancelled;
            case in_progress -> to == Booking.BookingStatus.completed || to == Booking.BookingStatus.cancelled;
            default -> false;
        };
        if (!valid) {
            throw new RuntimeException("Invalid status transition: " + from + " → " + to);
        }
    }

    private void logStatusChange(Booking booking, String oldStatus, String newStatus, User changedBy, String reason) {
        BookingStatusHistory history = new BookingStatusHistory();
        history.setBooking(booking);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(changedBy);
        history.setChangeReason(reason);
        historyRepository.save(history);
    }

    public List<BookingStatusHistory> getBookingHistory(Integer bookingId) {
        return historyRepository.findByBooking_BookingIdOrderByChangedAtAsc(bookingId);
    }

    @Transactional
    public Booking updateBookingNotes(Integer bookingId, Integer actorUserId, String notes, String scheduledDate,
            String scheduledTime) {
        Booking booking = getBookingById(bookingId);
        // Only allow edits when booking is still in 'requested' state
        if (booking.getBookingStatus() != Booking.BookingStatus.requested) {
            throw new RuntimeException("Can only edit a booking that is still in 'requested' status.");
        }
        if (notes != null)
            booking.setNotes(notes);
        if (scheduledDate != null && !scheduledDate.isBlank())
            booking.setScheduledDate(LocalDate.parse(scheduledDate));
        if (scheduledTime != null && !scheduledTime.isBlank())
            booking.setScheduledTime(LocalTime.parse(scheduledTime));
        return bookingRepository.save(booking);
    }

    @Transactional
    public void deleteBooking(Integer bookingId, Integer actorUserId) {
        Booking booking = getBookingById(bookingId);
        // Only allow deletion when in a terminal or initial cancellable state
        Booking.BookingStatus status = booking.getBookingStatus();
        if (status == Booking.BookingStatus.in_progress || status == Booking.BookingStatus.accepted) {
            throw new RuntimeException("Cannot delete an active booking. Cancel it first.");
        }
        historyRepository.deleteAll(historyRepository.findByBooking_BookingIdOrderByChangedAtAsc(bookingId));
        bookingRepository.delete(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<LocalDate> getWorkerBusyDates(Integer workerId) {
        return bookingRepository.findConflictingBookings(
                workerId,
                List.of(Booking.BookingStatus.accepted, Booking.BookingStatus.in_progress))
                .stream()
                .map(Booking::getScheduledDate)
                .distinct()
                .toList();
    }

    public List<Map<String, String>> getWorkerBusySlots(Integer workerId) {
        return bookingRepository.findConflictingBookings(
                workerId,
                List.of(Booking.BookingStatus.requested, Booking.BookingStatus.accepted, Booking.BookingStatus.in_progress))
                .stream()
                .map(b -> Map.of(
                        "scheduledDate", b.getScheduledDate().toString(),
                        "scheduledTime", b.getScheduledTime().toString()))
                .toList();
    }

    private void sendReviewReminders(Booking booking) {
        User workerUser = booking.getWorker().getUser();
        User customerUser = booking.getCustomer().getUser();

        String workerName = buildDisplayName(booking.getWorker().getFirstName(), booking.getWorker().getLastName(),
                workerUser.getEmail());
        String customerName = buildDisplayName(booking.getCustomer().getFirstName(), booking.getCustomer().getLastName(),
                customerUser.getEmail());

        notificationService.createNotification(
                customerUser,
                "Review your worker",
                "Please rate " + workerName + " for booking #" + booking.getBookingId() + ".",
                "/reviews");

        notificationService.createNotification(
                workerUser,
                "Review your customer",
                "Share feedback about " + customerName + " for booking #" + booking.getBookingId() + ".",
                "/reviews");
    }

    private String buildDisplayName(String firstName, String lastName, String fallback) {
        StringBuilder sb = new StringBuilder();
        if (firstName != null && !firstName.isBlank()) {
            sb.append(firstName.trim());
        }
        if (lastName != null && !lastName.isBlank()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(lastName.trim());
        }
        String result = sb.toString().trim();
        return result.isEmpty() ? fallback : result;
    }
}
