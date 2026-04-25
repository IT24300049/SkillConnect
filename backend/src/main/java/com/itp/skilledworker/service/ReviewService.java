package com.itp.skilledworker.service;

import com.itp.skilledworker.dto.ReviewComplaintDtos.PendingReviewResponse;
import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final int REVIEW_WINDOW_DAYS = 14;
        private static final int MIN_COMPLAINT_IMAGES = 1;
        private static final int MAX_COMPLAINT_IMAGES = 3;
        private static final long MAX_IMAGE_FILE_BYTES = 5L * 1024 * 1024;
        private static final Set<String> ALLOWED_IMAGE_TYPES = new HashSet<>(
            List.of("image/jpeg", "image/png", "image/webp"));

    private final ReviewRepository reviewRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintImageRepository complaintImageRepository;
    private final MessageRepository messageRepository;
    private final MessageThreadRepository messageThreadRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @Value("${upload.complaints-dir:uploads/complaints}")
    private String complaintsUploadDir;

    @Transactional
    public Review submitReview(Integer bookingId, Integer reviewerUserId, Integer revieweeUserId,
            Integer rating, String reviewText, String reviewerType) {
        if (reviewRepository.existsByBooking_BookingIdAndReviewer_UserId(bookingId, reviewerUserId)) {
            throw new RuntimeException("Review already submitted for this booking");
        }
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getBookingStatus() != Booking.BookingStatus.completed) {
            throw new RuntimeException("Can only review completed bookings");
        }
        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        User reviewee = userRepository.findById(revieweeUserId)
                .orElseThrow(() -> new RuntimeException("Reviewee not found"));

        boolean reviewerIsWorker = booking.getWorker().getUser().getUserId().equals(reviewerUserId);
        boolean reviewerIsCustomer = booking.getCustomer().getUser().getUserId().equals(reviewerUserId);
        if (!reviewerIsWorker && !reviewerIsCustomer) {
            throw new RuntimeException("Reviewer is not part of this booking");
        }

        if (reviewerIsWorker && !reviewee.getUserId().equals(booking.getCustomer().getUser().getUserId())) {
            throw new RuntimeException("Workers can only review the customer for this booking");
        }
        if (reviewerIsCustomer && !reviewee.getUserId().equals(booking.getWorker().getUser().getUserId())) {
            throw new RuntimeException("Customers can only review the assigned worker");
        }

        Review.ReviewerType resolvedType = reviewerIsWorker ? Review.ReviewerType.worker : Review.ReviewerType.customer;
        if (reviewerType != null && !resolvedType.name().equalsIgnoreCase(reviewerType)) {
            throw new RuntimeException("Reviewer type does not match booking role");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setJob(booking.getJob());
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setOverallRating(rating);
        review.setReviewText(reviewText);
        review.setReviewerType(resolvedType);
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsForWorker(Integer workerUserId) {
        return reviewRepository.findByReviewee_UserId(workerUserId);
    }

    public List<Review> getReviewsForCustomer(Integer customerUserId) {
        return reviewRepository.findByReviewee_UserId(customerUserId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Review> getMyReviews(Integer reviewerUserId) {
        return reviewRepository.findByReviewer_UserId(reviewerUserId);
    }

    public List<Complaint> getMyComplaints(Integer complainantUserId) {
        return complaintRepository.findByComplainant_UserId(complainantUserId);
    }

    public List<PendingReviewResponse> getPendingReviews(Integer reviewerUserId) {
        LocalDateTime since = LocalDateTime.now().minusDays(REVIEW_WINDOW_DAYS);
        return bookingRepository
                .findCompletedBookingsForUser(reviewerUserId, Booking.BookingStatus.completed, since)
                .stream()
                .filter(booking -> !reviewRepository
                        .existsByBooking_BookingIdAndReviewer_UserId(booking.getBookingId(), reviewerUserId))
                .map(booking -> toPendingReviewResponse(booking, reviewerUserId))
                .toList();
    }

        public List<PendingReviewResponse> getPendingReviewsForJob(Integer reviewerUserId, Integer jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Integer jobCustomerUserId = job.getCustomer().getUser().getUserId();

        return getPendingReviews(reviewerUserId).stream()
                .filter(p -> {
                    // Prefer exact job match when booking is linked to this job
                    if (p.getJobId() != null && p.getJobId().equals(jobId)) {
                        return true;
                    }

                    // Fallback: when booking has no job link, map by counterpart
                    // Worker viewing job: match on same customer
                    if (reviewer.getRole() == User.Role.worker) {
                        return p.getCustomerUserId() != null && p.getCustomerUserId().equals(jobCustomerUserId);
                    }

                    // Customer viewing job: keep only entries where the worker side exists
                    // (typically there will be a single pending review at a time)
                    if (reviewer.getRole() == User.Role.customer) {
                        return p.getWorkerUserId() != null;
                    }

                    return false;
                })
                .toList();
        }

    @Transactional
    public Complaint submitComplaint(Integer complainantUserId, String category,
            String title, String description, Integer bookingId, Integer complainedAgainstUserId,
            Integer reviewId) {
        return submitComplaint(complainantUserId, category, title, description, bookingId, complainedAgainstUserId, reviewId,
            null);
        }

        @Transactional
        public Complaint submitComplaint(Integer complainantUserId, String category,
            String title, String description, Integer bookingId, Integer complainedAgainstUserId,
            Integer reviewId, List<MultipartFile> images) {
        User complainant = userRepository.findById(complainantUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Complaint complaint = new Complaint();
        complaint.setComplainant(complainant);
        complaint.setComplaintCategory(Complaint.ComplaintCategory.valueOf(category.toLowerCase()));
        complaint.setComplaintTitle(title);
        complaint.setComplaintDescription(description);
        complaint.setComplaintStatus(Complaint.ComplaintStatus.pending);

        Integer effectiveBookingId = bookingId;
        Integer effectiveComplainedAgainstId = complainedAgainstUserId;
        if (reviewId != null) {
            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("Review not found"));
            complaint.setReview(review);
            if (effectiveBookingId == null) {
                effectiveBookingId = review.getBooking().getBookingId();
            } else if (!effectiveBookingId.equals(review.getBooking().getBookingId())) {
                throw new RuntimeException("Review does not belong to the provided booking");
            }
            if (effectiveComplainedAgainstId == null) {
                effectiveComplainedAgainstId = review.getReviewee().getUserId();
            }
        }

        if (effectiveComplainedAgainstId != null) {
            User complainedAgainst = userRepository.findById(effectiveComplainedAgainstId)
                    .orElseThrow(() -> new RuntimeException("Complained-against user not found"));
            if (complainedAgainst.getUserId().equals(complainantUserId)) {
                throw new RuntimeException("You cannot file a complaint against yourself");
            }
            complaint.setComplainedAgainst(complainedAgainst);
        }

        if (effectiveBookingId != null) {
            Booking booking = bookingRepository.findById(effectiveBookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            complaint.setBooking(booking);

            Integer bookingWorkerUserId = booking.getWorker().getUser().getUserId();
            Integer bookingCustomerUserId = booking.getCustomer().getUser().getUserId();

            if (complaint.getComplainedAgainst() == null) {
                Integer counterpartId = bookingWorkerUserId.equals(complainantUserId)
                        ? bookingCustomerUserId
                        : bookingWorkerUserId;
                if (counterpartId.equals(complainantUserId)) {
                    throw new RuntimeException("Unable to determine a valid counterpart for this booking");
                }
                User counterpart = userRepository.findById(counterpartId)
                        .orElseThrow(() -> new RuntimeException("Booking counterpart not found"));
                complaint.setComplainedAgainst(counterpart);
            } else {
                Integer targetId = complaint.getComplainedAgainst().getUserId();
                if (!targetId.equals(bookingWorkerUserId) && !targetId.equals(bookingCustomerUserId)) {
                    throw new RuntimeException("Selected user is not part of this booking");
                }
            }
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        if (images != null) {
            validateComplaintImages(images);
            saveComplaintImages(savedComplaint, images);
        }

        return complaintRepository.findById(savedComplaint.getComplaintId())
                .orElseThrow(() -> new RuntimeException("Complaint not found after save"));
    }

    public List<Complaint> getAllComplaints(Integer requestingUserId) {
        User actor = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (actor.getRole() != User.Role.admin) {
            throw new RuntimeException("Not authorized to view all complaints");
        }
        return complaintRepository.findAll();
    }

    @Transactional
    public Complaint updateComplaintStatus(Integer complaintId, Integer requestingUserId, String status) {
        User actor = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (actor.getRole() != User.Role.admin) {
            throw new RuntimeException("Not authorized to update complaint status");
        }
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setComplaintStatus(Complaint.ComplaintStatus.valueOf(status.toLowerCase()));
        if (status.equalsIgnoreCase("resolved")) {
            complaint.setResolvedAt(java.time.LocalDateTime.now());
        }
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Message sendMessage(Integer threadId, Integer senderUserId, String messageText) {
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Message message = new Message();
        message.setThreadId(threadId);
        message.setSender(sender);
        message.setMessageText(messageText);
        return messageRepository.save(message);
    }

    public List<Message> getThreadMessages(Integer threadId) {
        return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }

    @Transactional
    public MessageThread createThread(Integer userId1, Integer userId2, Integer bookingId) {
        User p1 = userRepository.findById(userId1).orElseThrow(() -> new RuntimeException("User not found"));
        User p2 = userRepository.findById(userId2).orElseThrow(() -> new RuntimeException("User not found"));
        MessageThread thread = new MessageThread();
        thread.setParticipant1(p1);
        thread.setParticipant2(p2);
        if (bookingId != null) {
            bookingRepository.findById(bookingId).ifPresent(thread::setBooking);
        }
        return messageThreadRepository.save(thread);
    }

    public List<MessageThread> getUserThreads(Integer userId) {
        return messageThreadRepository.findByParticipant1_UserIdOrParticipant2_UserId(userId, userId);
    }

    @Transactional
    public void deleteReview(Integer reviewId, Integer requestingUserId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        // Allow deletion only by the original reviewer or admin
        if (!review.getReviewer().getUserId().equals(requestingUserId)) {
            User actor = userRepository.findById(requestingUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (!actor.getRole().name().equalsIgnoreCase("admin")) {
                throw new RuntimeException("Not authorized to delete this review");
            }
        }
        reviewRepository.delete(review);
    }

    @Transactional
    public void deleteComplaint(Integer complaintId, Integer requestingUserId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        // Allow deletion only by the complainant or admin
        if (!complaint.getComplainant().getUserId().equals(requestingUserId)) {
            User actor = userRepository.findById(requestingUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (!actor.getRole().name().equalsIgnoreCase("admin")) {
                throw new RuntimeException("Not authorized to delete this complaint");
            }
        }
        complaintRepository.delete(complaint);
    }

    @Transactional
    public Review updateReview(Integer reviewId, Integer requestingUserId, Integer rating, String reviewText) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getReviewer().getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Not authorized to edit this review");
        }
        if (rating != null)
            review.setOverallRating(rating);
        if (reviewText != null)
            review.setReviewText(reviewText);
        return reviewRepository.save(review);
    }

    private PendingReviewResponse toPendingReviewResponse(Booking booking, Integer reviewerUserId) {
        PendingReviewResponse pending = new PendingReviewResponse();
        pending.setBookingId(booking.getBookingId());
        pending.setJobId(booking.getJob() != null ? booking.getJob().getJobId() : null);
        pending.setJobTitle(booking.getJob() != null ? booking.getJob().getJobTitle() : null);
        pending.setCompletedAt(booking.getCompletedAt() != null ? booking.getCompletedAt().toString() : null);
        pending.setReviewDeadline(booking.getCompletedAt() != null
                ? booking.getCompletedAt().plusDays(REVIEW_WINDOW_DAYS).toString()
                : null);

        Integer workerUserId = booking.getWorker().getUser().getUserId();
        Integer customerUserId = booking.getCustomer().getUser().getUserId();
        pending.setWorkerUserId(workerUserId);
        pending.setCustomerUserId(customerUserId);

        boolean reviewerIsWorker = workerUserId.equals(reviewerUserId);
        pending.setReviewerType(reviewerIsWorker ? "worker" : "customer");

        if (reviewerIsWorker) {
            User reviewee = booking.getCustomer().getUser();
            pending.setRevieweeUserId(reviewee.getUserId());
            pending.setRevieweeEmail(reviewee.getEmail());
            pending.setRevieweeName(fullName(
                    booking.getCustomer().getFirstName(),
                    booking.getCustomer().getLastName(),
                    reviewee.getEmail()));
        } else {
            User reviewee = booking.getWorker().getUser();
            pending.setRevieweeUserId(reviewee.getUserId());
            pending.setRevieweeEmail(reviewee.getEmail());
            pending.setRevieweeName(fullName(
                    booking.getWorker().getFirstName(),
                    booking.getWorker().getLastName(),
                    reviewee.getEmail()));
        }
        return pending;
    }

    private String fullName(String firstName, String lastName, String fallback) {
        StringBuilder sb = new StringBuilder();
        if (firstName != null)
            sb.append(firstName.trim());
        if (lastName != null) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(lastName.trim());
        }
        String name = sb.toString().trim();
        return name.isEmpty() ? fallback : name;
    }

    private void validateComplaintImages(List<MultipartFile> images) {
        if (images.isEmpty()) {
            throw new RuntimeException("At least 1 image is required");
        }
        if (images.size() > MAX_COMPLAINT_IMAGES) {
            throw new RuntimeException("You can upload up to 3 images only");
        }
        if (images.size() < MIN_COMPLAINT_IMAGES) {
            throw new RuntimeException("At least 1 image is required");
        }

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                throw new RuntimeException("Image files must not be empty");
            }
            if (image.getSize() > MAX_IMAGE_FILE_BYTES) {
                throw new RuntimeException("Each image must be 5MB or less");
            }
            String contentType = image.getContentType();
            if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
                throw new RuntimeException("Only JPEG, PNG, and WebP images are allowed");
            }
        }
    }

    private void saveComplaintImages(Complaint complaint, List<MultipartFile> images) {
        try {
            Path baseDir = Paths.get(complaintsUploadDir).toAbsolutePath().normalize();
            Files.createDirectories(baseDir);

            for (int i = 0; i < images.size(); i++) {
                MultipartFile image = images.get(i);
                String imagePath = saveComplaintImageFile(baseDir, complaint.getComplaintId(), image);

                ComplaintImage complaintImage = new ComplaintImage();
                complaintImage.setComplaint(complaint);
                complaintImage.setImageUrl(imagePath);
                complaintImage.setSortOrder(i + 1);
                complaintImageRepository.save(complaintImage);
                complaint.getComplaintImages().add(complaintImage);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to save complaint images", e);
        }
    }

    private String saveComplaintImageFile(Path baseDir, Integer complaintId, MultipartFile file) throws IOException {
        String extension = getExtension(file.getOriginalFilename());
        String filename = "complaint_" + complaintId + "_" + UUID.randomUUID() + extension;
        Path targetPath = baseDir.resolve(filename).normalize();

        if (!targetPath.getParent().equals(baseDir)) {
            throw new RuntimeException("Invalid file path");
        }

        file.transferTo(targetPath.toFile());
        return "/uploads/complaints/" + filename;
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex < 0) {
            return "";
        }
        return originalFilename.substring(dotIndex);
    }
}
