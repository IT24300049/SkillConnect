package com.itp.skilledworker.service;

import com.itp.skilledworker.entity.Booking;
import com.itp.skilledworker.entity.CustomerProfile;
import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.entity.WorkerProfile;
import com.itp.skilledworker.exception.BookingException;
import com.itp.skilledworker.repository.BookingRepository;
import com.itp.skilledworker.repository.BookingStatusHistoryRepository;
import com.itp.skilledworker.repository.CustomerProfileRepository;
import com.itp.skilledworker.repository.JobRepository;
import com.itp.skilledworker.repository.UserRepository;
import com.itp.skilledworker.repository.WorkerAvailabilityRepository;
import com.itp.skilledworker.repository.WorkerProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private BookingStatusHistoryRepository historyRepository;
    @Mock private JobRepository jobRepository;
    @Mock private WorkerProfileRepository workerProfileRepository;
    @Mock private WorkerAvailabilityRepository workerAvailabilityRepository;
    @Mock private CustomerProfileRepository customerProfileRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void getBookingById_forbiddenForUnrelatedUser() {
        Booking booking = buildBooking(10, Booking.BookingStatus.requested, 2, 100, 200, LocalDate.now(), LocalTime.of(9, 0));
        User unrelated = buildUser(999, User.Role.customer);

        when(bookingRepository.findById(10)).thenReturn(Optional.of(booking));
        when(userRepository.findById(999)).thenReturn(Optional.of(unrelated));

        BookingException ex = assertThrows(BookingException.class, () -> bookingService.getBookingById(10, 999));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void updateBookingStatus_customerCannotCancelInProgress() {
        Booking booking = buildBooking(11, Booking.BookingStatus.in_progress, 2, 101, 201, LocalDate.now(), LocalTime.of(10, 0));
        User customerActor = buildUser(101, User.Role.customer);

        when(bookingRepository.findById(11)).thenReturn(Optional.of(booking));
        when(userRepository.findById(101)).thenReturn(Optional.of(customerActor));

        BookingException ex = assertThrows(
                BookingException.class,
                () -> bookingService.updateBookingStatus(11, "cancelled", 101, "Need urgent stop"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createBooking_rejectsOverlappingSlot() {
        LocalDate date = LocalDate.now().plusDays(1);
        WorkerProfile worker = buildWorker(300, 201, true);
        CustomerProfile customer = buildCustomer(400, 101);
        Booking existing = buildBooking(55, Booking.BookingStatus.accepted, 2, 101, 201, date, LocalTime.of(9, 0));

        when(workerProfileRepository.findById(201)).thenReturn(Optional.of(worker));
        when(customerProfileRepository.findByUser_UserId(101)).thenReturn(Optional.of(customer));
        when(workerAvailabilityRepository.findByWorker_WorkerIdAndAvailableDate(300, date)).thenReturn(List.of());
        when(bookingRepository.findConflictingBookings(eq(300), eq(date), any())).thenReturn(List.of(existing));

        BookingException ex = assertThrows(
                BookingException.class,
                () -> bookingService.createBooking(null, 201, 101, date.toString(), "10:00", "overlap check"));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void getBookingStats_returnsCompletedAndPendingCounts() {
        Booking completed = buildBooking(1, Booking.BookingStatus.completed, 2, 101, 201, LocalDate.now(), LocalTime.NOON);
        completed.setFinalCost(BigDecimal.valueOf(10000));
        Booking requested = buildBooking(2, Booking.BookingStatus.requested, 2, 101, 201, LocalDate.now(), LocalTime.NOON);
        Booking cancelled = buildBooking(3, Booking.BookingStatus.cancelled, 2, 101, 201, LocalDate.now(), LocalTime.NOON);

        when(bookingRepository.findAll()).thenReturn(List.of(completed, requested, cancelled));

        Map<String, Long> stats = bookingService.getBookingStats();
        assertEquals(1L, stats.get("completed"));
        assertEquals(1L, stats.get("pending"));
    }

    private Booking buildBooking(
            int bookingId,
            Booking.BookingStatus status,
            int durationHours,
            int customerUserId,
            int workerUserId,
            LocalDate date,
            LocalTime time) {
        Booking booking = new Booking();
        booking.setBookingId(bookingId);
        booking.setBookingStatus(status);
        booking.setEstimatedDurationHours(durationHours);
        booking.setScheduledDate(date);
        booking.setScheduledTime(time);
        booking.setCustomer(buildCustomer(500 + bookingId, customerUserId));
        booking.setWorker(buildWorker(600 + bookingId, workerUserId, true));
        return booking;
    }

    private CustomerProfile buildCustomer(int customerId, int userId) {
        CustomerProfile customer = new CustomerProfile();
        customer.setCustomerId(customerId);
        customer.setUser(buildUser(userId, User.Role.customer));
        customer.setFirstName("Customer");
        customer.setLastName("User");
        return customer;
    }

    private WorkerProfile buildWorker(int workerId, int userId, boolean verified) {
        WorkerProfile worker = new WorkerProfile();
        worker.setWorkerId(workerId);
        worker.setUser(buildUser(userId, User.Role.worker));
        worker.setFirstName("Worker");
        worker.setLastName("User");
        worker.setIsVerified(verified);
        return worker;
    }

    private User buildUser(int userId, User.Role role) {
        User user = new User();
        user.setUserId(userId);
        user.setRole(role);
        user.setEmail("user" + userId + "@test.com");
        return user;
    }
}
