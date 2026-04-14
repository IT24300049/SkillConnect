# Post-Job Review & Feedback Plan

## 1. Objective
Enable both customers and workers to complete the service loop by submitting reviews, feedback, and complaints once a job has been fulfilled. The feature should:
- Provide a clear, role-specific flow for when and how ratings can be submitted.
- Prevent duplicate reviews for the same booking while still allowing complaint escalation later.
- Surface reviews/complaints across the platform (profile pages, booking history, admin dashboards).

## 2. Flow of Events
1. **Job Completion Trigger**
   - When a job moves to `completed` status (via booking workflow or manual action), the system records a `completion timestamp`.
   - Eligible reviewer pairs are registered: `customer ➜ worker` and `worker ➜ customer`.
2. **Review Reminder**
   - A notification is dispatched to both parties with a deep-link to the relevant review form.
3. **Review Submission**
   - Customer submits: rating (1–5), text feedback, optional photo(s), selects booking/job reference.
   - Worker submits: professionalism feedback on customer, optional internal notes, option to flag as complaint.
4. **Complaint Route**
   - Either party can escalate by filing a complaint tied to the same booking/job, referencing the review if it exists.
5. **Post-Submission**
   - Reviews become immutable but can be hidden by admins.
   - Complaints trigger the existing complaint workflow (status tracking, admin response).

## 3. Backend Work
### 3.1 Entities & Relations
- `reviews` table already exists; extend schema if needed with `job_id`, `booking_id`, `role` fields to disambiguate who reviewed whom.
- Introduce `review_tokens` (or reuse bookings) to track pending review rights to avoid duplicates.
- Ensure complaints table can reference `review_id` (nullable) for traceability.

### 3.2 Services
- **BookingService**: on `completeBooking`, call `ReviewEligibilityService.registerPair(bookingId, customerUserId, workerUserId)`.
- **ReviewService**:
  - `createReview(reviewerId, revieweeId, bookingId, jobId, role, rating, comment)` with validation (one review per pair per booking).
  - `getReviewsForWorker(workerUserId)` / `getReviewsByUser(userId)` / `getPendingReviews(userId)`.
- **ComplaintService**: accept optional `reviewId` and auto-link booking/job context.

### 3.3 APIs
- `POST /api/reviews` – submit review (requires `bookingId` and `role`).
- `GET /api/reviews/pending` – returns outstanding review opportunities.
- `GET /api/reviews/my` – list reviews written by current user.
- `GET /api/reviews/worker/{workerUserId}` & `GET /api/reviews/customer/{customerUserId}` – display on profiles.
- `POST /api/complaints` – extend payload to include `reviewId` and `bookingId`.

## 4. Frontend Work
### 4.1 Customer Experience
- **Jobs/Bookings Page**: show a "Leave Review" CTA when status = completed and review not yet submitted.
- **Review Modal/Page**: rating stars, text input, optional attachments, complaint toggle.
- **Notifications**: highlight pending reviews; clicking opens review form.

### 4.2 Worker Experience
- **Dashboard**: pending review tasks + ability to rate customers.
- **Profile View**: show aggregate rating, latest reviews, complaint status badges.
- **Complaints UI**: allow quick complaint submission referencing booking/review.

### 4.3 Shared Components
- `ReviewForm` component reused by both roles (props to control fields).
- `RatingBadge` for summary display.
- `ReviewTimeline` for admin/user history.

## 5. Validation & Safeguards
- Review submission allowed only after job/booking completion and before a 14-day expiry.
- Single review per booking per reviewer; attempt to resubmit should return descriptive error.
- Ratings must be integers 1–5; enforce minimum text length (e.g., 20 chars) to ensure meaningful feedback.
- Complaints require reason category + description; if tied to a review, auto-fill summary.

## 6. Notifications
- New notification types: `REVIEW_REQUEST_CUSTOMER`, `REVIEW_REQUEST_WORKER`, `REVIEW_RECEIVED`.
- Notifications should deep-link to `/bookings/{bookingId}/review` or `/complaints/new?bookingId=...`.

## 7. Rollout Steps
1. **Backend preparation**: extend schema/migrations, implement eligibility + review services, write unit tests for duplicate prevention and permission checks.
2. **Frontend MVP**: add pending review banners on bookings + job detail pages, implement modal with validation, wire to APIs.
3. **Complaints integration**: add optional complaint form entry points, ensure cross-linking to reviews.
4. **Polish**: display review summaries on worker/customer profiles, add admin moderation tools if needed.
5. **QA & UAT**: test end-to-end scenarios (customer reviews worker, worker reviews customer, complaint escalation), confirm notifications and visibility.

## 8. Risks & Mitigations
- **Duplicate Reviews**: mitigate via server-side unique constraint (booking + reviewer).
- **Toxic Feedback**: provide admin moderation flags, consider profanity filter.
- **Orphaned Complaints**: always require booking/job reference to keep data relational.
- **Notification Overload**: batch reminders (e.g., daily digest) if volume grows.

---
This plan keeps the review cycle aligned with completed bookings, ensures both parties have symmetrical tools, and ties complaints into the same workflow for a complete post-job feedback loop.
