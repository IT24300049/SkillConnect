package com.itp.skilledworker.service;

import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.exception.BookingException;
import com.itp.skilledworker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingService {
    private static final int DEFAULT_DURATION_HOURS = 2;

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
                    .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Job not found"));
            if (!job.getCustomer().getUser().getUserId().equals(customerUserId)) {
                throw new BookingException(HttpStatus.FORBIDDEN, "You can only link your own job to a booking.");
            }
        }
        WorkerProfile worker = workerProfileRepository.findById(workerId)
            .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Worker not found"));
        if (!Boolean.TRUE.equals(worker.getIsVerified())) {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Worker is not verified and cannot be booked yet.");
        }
        CustomerProfile customer = customerProfileRepository.findByUser_UserId(customerUserId)
                .orElseThrow(
                        () -> new BookingException(HttpStatus.BAD_REQUEST, "Customer profile not found. Please complete your profile first."));

        LocalDate date = LocalDate.parse(scheduledDate);
        LocalTime time = LocalTime.parse(scheduledTime);
        int requestedDurationHours = DEFAULT_DURATION_HOURS;
        LocalTime requestedEnd = time.plusHours(requestedDurationHours);

        // If the worker has configured availability entries for this date,
        // enforce that the requested window falls inside at least one
        // explicitly available window. If they have not configured anything
        // for this date, treat the worker as available by default.
        validateWorkerAvailabilityWindow(worker.getWorkerId(), date, time, requestedEnd);
        ensureNoOverlappingBooking(worker.getWorkerId(), date, time, requestedEnd, null);

        Booking booking = new Booking();
        booking.setJob(job);
        booking.setWorker(worker);
        booking.setCustomer(customer);
        booking.setScheduledDate(date);
        booking.setScheduledTime(time);
        booking.setEstimatedDurationHours(requestedDurationHours);
        booking.setNotes(notes);
        booking.setBookingStatus(Booking.BookingStatus.requested);
        booking = bookingRepository.save(booking);

        logStatusChange(booking, null, Booking.BookingStatus.requested.name(), customer.getUser(), "Booking created");
        
        notificationService.createNotification(
            worker.getUser(),
            "New Booking Request",
            customer.getFirstName() + " requested a booking for " + date + " at " + time + ".",
            "/worker/bookings"
        );
        
        return booking;
    }

    public List<Booking> getBookingsForWorker(Integer workerUserId) {
        WorkerProfile worker = workerProfileRepository.findByUser_UserId(workerUserId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Worker profile not found"));
        return bookingRepository.findByWorker_WorkerId(worker.getWorkerId());
    }

    public List<Booking> getBookingsForCustomer(Integer customerUserId) {
        CustomerProfile customer = customerProfileRepository.findByUser_UserId(customerUserId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Customer profile not found"));
        return bookingRepository.findByCustomer_CustomerId(customer.getCustomerId());
    }

    public Booking getBookingById(Integer bookingId, Integer actorUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Booking not found"));
        User actor = userRepository.findById(actorUserId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "User not found"));
        assertCanAccessBooking(booking, actor);
        return booking;
    }

    @Transactional
    public Booking updateBookingStatus(Integer bookingId, String newStatus, Integer actorUserId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Booking not found"));
        User actor = userRepository.findById(actorUserId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "User not found"));
        assertCanAccessBooking(booking, actor);

        Booking.BookingStatus oldStatus = booking.getBookingStatus();
        Booking.BookingStatus targetStatus = Booking.BookingStatus.valueOf(newStatus);

        validateTransition(oldStatus, targetStatus);
        validateTransitionActorPermissions(booking, actor, targetStatus);

        booking.setBookingStatus(targetStatus);

        if (targetStatus == Booking.BookingStatus.cancelled) {
            booking.setCancellationReason(reason);
            booking.setCancelledAt(LocalDateTime.now());
        }
        if (targetStatus == Booking.BookingStatus.completed) {
            booking.setCompletedAt(LocalDateTime.now());
        }

        booking = bookingRepository.save(booking);
        logStatusChange(booking, oldStatus.name(), targetStatus.name(), actor, reason);

        notifyCustomerOnStatusChange(booking, targetStatus);

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
            throw new BookingException(HttpStatus.BAD_REQUEST, "Invalid status transition: " + from + " → " + to);
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

    public List<BookingStatusHistory> getBookingHistory(Integer bookingId, Integer actorUserId) {
        Booking booking = getBookingById(bookingId, actorUserId);
        return historyRepository.findByBooking_BookingIdOrderByChangedAtAsc(booking.getBookingId());
    }

    @Transactional
    public Booking updateBookingNotes(Integer bookingId, Integer actorUserId, String notes, String scheduledDate,
            String scheduledTime) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Booking not found"));
        User actor = userRepository.findById(actorUserId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "User not found"));
        assertCanAccessBooking(booking, actor);
        if (!actor.getRole().equals(User.Role.admin)
                && !booking.getCustomer().getUser().getUserId().equals(actor.getUserId())) {
            throw new BookingException(HttpStatus.FORBIDDEN, "Only the customer can edit this booking.");
        }

        // Only allow edits when booking is still in 'requested' state
        if (booking.getBookingStatus() != Booking.BookingStatus.requested) {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Can only edit a booking that is still in 'requested' status.");
        }
        if (notes != null) {
            booking.setNotes(notes);
        }

        LocalDate newDate = booking.getScheduledDate();
        LocalTime newTime = booking.getScheduledTime();
        if (scheduledDate != null && !scheduledDate.isBlank()) {
            newDate = LocalDate.parse(scheduledDate);
        }
        if (scheduledTime != null && !scheduledTime.isBlank()) {
            newTime = LocalTime.parse(scheduledTime);
        }

        int durationHours = resolveDurationHours(booking.getEstimatedDurationHours());
        LocalTime requestedEnd = newTime.plusHours(durationHours);
        validateWorkerAvailabilityWindow(booking.getWorker().getWorkerId(), newDate, newTime, requestedEnd);
        ensureNoOverlappingBooking(booking.getWorker().getWorkerId(), newDate, newTime, requestedEnd, booking.getBookingId());

        booking.setScheduledDate(newDate);
        booking.setScheduledTime(newTime);
        return bookingRepository.save(booking);
    }

    @Transactional
    public void deleteBooking(Integer bookingId, Integer actorUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Booking not found"));
        User actor = userRepository.findById(actorUserId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "User not found"));
        assertCanAccessBooking(booking, actor);

        boolean isAdmin = actor.getRole() == User.Role.admin;
        boolean isCustomerOwner = booking.getCustomer().getUser().getUserId().equals(actor.getUserId());
        if (!isAdmin && !isCustomerOwner) {
            throw new BookingException(HttpStatus.FORBIDDEN, "Only the customer can delete this booking.");
        }

        // Only allow deletion when in a terminal or initial cancellable state
        Booking.BookingStatus status = booking.getBookingStatus();
        if (status == Booking.BookingStatus.in_progress || status == Booking.BookingStatus.accepted) {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Cannot delete an active booking. Cancel it first.");
        }
        historyRepository.deleteAll(historyRepository.findByBooking_BookingIdOrderByChangedAtAsc(bookingId));
        bookingRepository.delete(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Map<String, Long> getBookingStats() {
        List<Booking> bookings = bookingRepository.findAll();
        long completed = bookings.stream().filter(b -> b.getBookingStatus() == Booking.BookingStatus.completed).count();
        long pending = bookings.stream().filter(b -> b.getBookingStatus() == Booking.BookingStatus.requested).count();
        return Map.of("completed", completed, "pending", pending);
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

    private void notifyCustomerOnStatusChange(Booking booking, Booking.BookingStatus status) {
        if (status != Booking.BookingStatus.accepted
                && status != Booking.BookingStatus.rejected
                && status != Booking.BookingStatus.cancelled) {
            return;
        }

        String title;
        String message;
        if (status == Booking.BookingStatus.accepted) {
            title = "Booking Accepted";
            message = "Your booking for " + booking.getScheduledDate() + " has been accepted.";
        } else if (status == Booking.BookingStatus.rejected) {
            title = "Booking Rejected";
            message = "Your booking for " + booking.getScheduledDate() + " was rejected.";
        } else {
            title = "Booking Cancelled";
            message = "Your booking for " + booking.getScheduledDate() + " has been cancelled.";
        }

        notificationService.createNotification(
                booking.getCustomer().getUser(),
                title,
                message,
                "/bookings");
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

    private int resolveDurationHours(Integer durationHours) {
        if (durationHours == null || durationHours <= 0) {
            return DEFAULT_DURATION_HOURS;
        }
        return durationHours;
    }

    private void validateWorkerAvailabilityWindow(Integer workerId, LocalDate date, LocalTime start, LocalTime end) {
        List<WorkerAvailability> dayAvailability = workerAvailabilityRepository
                .findByWorker_WorkerIdAndAvailableDate(workerId, date);
        if (dayAvailability.isEmpty()) {
            return;
        }

        boolean hasCoveringWindow = dayAvailability.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsAvailable()))
                .anyMatch(a -> a.getStartTime() != null
                        && a.getEndTime() != null
                        && !a.getStartTime().isAfter(start)
                        && !a.getEndTime().isBefore(end));

        if (!hasCoveringWindow) {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Worker is not available for the selected booking duration.");
        }
    }

    private void ensureNoOverlappingBooking(
            Integer workerId,
            LocalDate date,
            LocalTime requestedStart,
            LocalTime requestedEnd,
            Integer excludeBookingId) {
        List<Booking> dayBookings = bookingRepository.findConflictingBookings(
                workerId,
                date,
                List.of(Booking.BookingStatus.requested, Booking.BookingStatus.accepted, Booking.BookingStatus.in_progress));

        for (Booking existing : dayBookings) {
            if (excludeBookingId != null && excludeBookingId.equals(existing.getBookingId())) {
                continue;
            }
            LocalTime existingStart = existing.getScheduledTime();
            int duration = resolveDurationHours(existing.getEstimatedDurationHours());
            LocalTime existingEnd = existingStart.plusHours(duration);

            if (requestedStart.isBefore(existingEnd) && existingStart.isBefore(requestedEnd)) {
                throw new BookingException(HttpStatus.CONFLICT, "Selected slot overlaps with an existing booking.");
            }
        }
    }

    private void assertCanAccessBooking(Booking booking, User actor) {
        if (actor.getRole() == User.Role.admin) {
            return;
        }
        Integer actorId = actor.getUserId();
        Integer customerUserId = booking.getCustomer().getUser().getUserId();
        Integer workerUserId = booking.getWorker().getUser().getUserId();
        if (!actorId.equals(customerUserId) && !actorId.equals(workerUserId)) {
            throw new BookingException(HttpStatus.FORBIDDEN, "Unauthorized booking access.");
        }
    }

    private void validateTransitionActorPermissions(Booking booking, User actor, Booking.BookingStatus targetStatus) {
        if (actor.getRole() == User.Role.admin) {
            return;
        }
        boolean isWorker = booking.getWorker().getUser().getUserId().equals(actor.getUserId());
        boolean isCustomer = booking.getCustomer().getUser().getUserId().equals(actor.getUserId());

        if (isWorker) {
            return;
        }
        if (isCustomer && targetStatus == Booking.BookingStatus.cancelled) {
            Booking.BookingStatus current = booking.getBookingStatus();
            if (current == Booking.BookingStatus.requested || current == Booking.BookingStatus.accepted) {
                return;
            }
            throw new BookingException(HttpStatus.BAD_REQUEST, "Customers can only cancel requested or accepted bookings.");
        }
        throw new BookingException(HttpStatus.FORBIDDEN, "You are not allowed to change this booking status.");
    }
}
