package com.itp.skilledworker.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "complaint_id")
    private Integer complaintId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "complainant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User complainant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "complained_against_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User complainedAgainst;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "review_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Review review;

    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_category", nullable = false)
    private ComplaintCategory complaintCategory;

    @Column(name = "complaint_title", nullable = false)
    private String complaintTitle;

    @Column(name = "complaint_description", nullable = false, columnDefinition = "TEXT")
    private String complaintDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_status")
    private ComplaintStatus complaintStatus = ComplaintStatus.pending;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.medium;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    @JsonIgnoreProperties("complaint")
    private List<ComplaintImage> complaintImages = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ComplaintCategory {
        service_quality, inappropriate_behavior, fraud, payment_issue, other
    }

    public enum ComplaintStatus {
        pending, investigating, resolved, rejected
    }

    public enum Priority {
        low, medium, high, urgent
    }
}
