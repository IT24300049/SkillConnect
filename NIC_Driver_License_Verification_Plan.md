# NIC / Driver License Verification – Implementation Plan

This document describes how to add a document-based verification flow for workers in SkillConnect.

Goal:
- Workers must upload NIC or driver license images (front + back).
- Admin reviews uploads and sets verification status: **Submitted → Processing → Approved/Rejected**.
- **Unverified workers cannot be booked** by customers until approved.
file maximum size should be 5mb.

---

## 1. Data Model & Database Changes

### 1.1. Worker verification entity

Add a new table `worker_verifications` instead of overloading `worker_profiles`:

- `id` (PK, bigint, auto-increment)
- `worker_id` (FK → `worker_profiles.worker_id`, unique)
- `document_type` (ENUM: `NIC`, `DRIVER_LICENSE`)
- `front_image_url` (varchar) – path or URL to stored image
- `back_image_url` (varchar)
- `status` (ENUM: `SUBMITTED`, `PROCESSING`, `APPROVED`, `REJECTED`)
- `rejection_reason` (text, nullable)
- `submitted_at` (datetime)
- `reviewed_at` (datetime, nullable)
- `reviewed_by_admin_id` (FK → `users.user_id`, nullable)

Add a one-to-one relation in the backend between `WorkerProfile` and `WorkerVerification`.

### 1.2. Reuse existing flags

`worker_profiles` already has:
- `is_verified` (boolean)
- `verification_date` (datetime)

Plan:
- Treat `is_verified = true` as **Approved**.
- `verification_date` = `reviewed_at` timestamp.
- When `status` becomes `APPROVED`, set these fields in `worker_profiles` too for backward compatibility.

> Migration note: For existing demo data, we can consider all current workers as `APPROVED` or reset them to `SUBMITTED` depending on assignment requirements.

---

## 2. Backend API Design (Spring Boot)

### 2.1. Worker-facing endpoints (authenticated as worker)

Controller: extend `WorkerController` or add `VerificationController`.

1. **Upload / update verification documents**
   - `POST /api/workers/me/verification`
   - Request: `multipart/form-data`
     - `documentType` (string: `NIC` or `DRIVER_LICENSE`)
     - `frontImage` (file)
     - `backImage` (file)
   - Behavior:
     - Create or update the `WorkerVerification` row for the current worker.
     - Set `status = SUBMITTED`, `submitted_at = now`, clear `rejection_reason`, clear `reviewed_at`, `reviewed_by_admin_id`.
     - Do **not** automatically mark `is_verified`.
   - Response: generic `ApiResponse<WorkerVerificationDto>`.

2. **View own verification status**
   - `GET /api/workers/me/verification`
   - Returns current verification record for the worker, including:
     - `status`
     - `documentType`
     - image URLs (for preview)
     - `rejectionReason` (if any)

### 2.2. Admin-facing endpoints

Controller: extend `AdminController` or create `AdminVerificationController` with `@PreAuthorize("hasRole('ADMIN')")`.

1. **List verifications with filters**
   - `GET /api/admin/verifications?status=SUBMITTED&search=...`
   - Supports `status` filter, optional search by worker name/email.

2. **Get a single worker verification**
   - `GET /api/admin/verifications/{workerId}`

3. **Update verification status**
   - `PATCH /api/admin/verifications/{workerId}`
   - Request body:
     - `status`: `PROCESSING` | `APPROVED` | `REJECTED`
     - `rejectionReason` (optional; required when `REJECTED`)
   - Behavior:
     - Update `worker_verifications.status` accordingly.
     - If `APPROVED`:
       - set `worker_profiles.is_verified = true` and `verification_date = now()`.
     - If `REJECTED`:
       - set `worker_profiles.is_verified = false`.
     - Set `reviewed_by_admin_id` and `reviewed_at = now()`.

### 2.3. Booking & worker listing rules

1. **Worker visibility in listings**
   - Update `UserService.getAllWorkers(...)` to:
     - Already filters `isActive = true`.
     - **New rule:** Only include workers that are either:
       - `is_verified = true`, OR
       - project requirement allows showing but not booking (see next point).
   - To strictly hide unapproved workers, filter by `isVerified = true` in addition to `isActive`.

2. **Booking restrictions**
   - In `BookingService` when creating a booking for a worker:
     - Fetch the target worker profile.
     - If `is_verified` is not `true`, throw a business exception like `"Worker is not verified and cannot be booked yet"`.

3. **Admin or worker APIs that rely on verification**
   - Keep admin APIs unrestricted; they can see all workers and their statuses.

---

## 3. Frontend – Worker Experience (React)

### 3.1. Worker profile page updates

Page: `ProfilePage.jsx` (when logged in as worker).

Add a new section: **"Identity Verification"**.

- Show current status with a badge:
  - `SUBMITTED` → grey "Submitted"
  - `PROCESSING` → blue "Processing"
  - `APPROVED` → green "Approved"
  - `REJECTED` → red "Rejected" + reason text
- Show a small explainer: "Upload a clear photo of your NIC or driver license (front and back). Your profile must be approved before customers can book you."

### 3.2. Upload form

- Two file inputs (or drag-and-drop tiles):
  - "Front side"
  - "Back side"
- Radio or select for `Document type` (NIC / Driver License).
- Submit button calls `workerAPI.uploadVerification(formData)`:
  - New function in `frontend/src/api.js`.
- After success:
  - Refresh status via `GET /workers/me/verification`.
  - Show toast/snackbar: "Documents submitted for review".

### 3.3. Status gating in UI

- On the worker dashboard or profile, show a prominent banner when `status` is not `APPROVED`:
  - "Your documents are under review. Customers cannot book you until verification is approved."
- Optionally disable worker-side job application or booking acceptance actions until approved.

---

## 4. Frontend – Customer Experience

- Worker cards already show a badge like `✓ Verified` vs `Pending`.
- Update logic to:
  - `Verified` if `isVerified = true`.
  - `Pending verification` otherwise.
- Ensure the workers listing for customers only includes verified workers (if we enforce visibility at backend, frontend just displays what it receives).

---

## 5. Frontend – Admin Experience

Create a new admin page: `AdminVerificationsPage.jsx`.

### 5.1. Listing view

- Route: `/admin/verifications` (protected by admin role).
- Table columns:
  - Worker name + email
  - Document type
  - Status
  - Submitted at
  - Quick action button: "Review".

### 5.2. Detail / review view

- On clicking "Review" open a modal or dedicated page:
  - Show worker details (name, district, skill category, ratings).
  - Show front/back document images with zoom.
  - Buttons:
    - `Mark as Processing`
    - `Approve`
    - `Reject` (with textarea for reason)
- Calls admin API `PATCH /api/admin/verifications/{workerId}`.

### 5.3. Feedback to worker

- When status becomes `APPROVED` or `REJECTED`, the worker sees the updated status on their profile page the next time they open it (or via polling/refresh).

---

## 6. Storage Strategy for Images

For this assignment, a simple file-system-based approach is sufficient:

- Backend property: `upload.dir` (e.g., `uploads/verification/`).
- On upload:
  - Generate a unique filename per worker and side (e.g., `worker-{id}-front-{timestamp}.jpg`).
  - Save to `upload.dir` and store the relative path in `front_image_url` / `back_image_url`.
- Expose a static resource handler in Spring for `/uploads/**` to serve the files, or a small controller that streams them with access control (admin + the worker only).

Security considerations:
- Accept only image MIME types (JPEG/PNG) and limit max file size.
- Never allow arbitrary path traversal from client.

---

## 7. Validation & Edge Cases

- Workers must upload **both** front and back images.
- If admin rejects, worker should be able to re-upload documents; this resets status back to `SUBMITTED`.
- Prevent double-booking attempts while status is changing by always checking `is_verified` at booking time.
- If a worker account is deactivated (`is_active = false`), they remain non-bookable regardless of verification status.

---

## 8. Step-by-Step Implementation Order

1. **Database layer**
   - Create `worker_verifications` table and JPA entity + repository.
   - Wire one-to-one relation from `WorkerProfile` to `WorkerVerification`.
2. **Service logic**
   - Add methods in `UserService` or a new `VerificationService`:
     - `getOrCreateVerificationForWorker(email)`
     - `submitVerification(email, dto/files)`
     - `adminUpdateVerification(workerId, status, reason, adminEmail)`
3. **Controllers**
   - Worker endpoints: upload + get status.
   - Admin endpoints: list, get one, update status.
4. **Booking rules**
   - Enforce `is_verified` check in `BookingService`.
   - Optionally filter unverified workers from `/api/workers`.
5. **Frontend APIs**
   - Add `workerAPI.getMyVerification()` and `workerAPI.submitVerification(formData)`.
   - Add `adminVerificationAPI` in `api.js` for list/update calls.
6. **Worker UI**
   - Add verification section to `ProfilePage.jsx`.
   - Render status badge, upload form, and messages.
7. **Admin UI**
   - Add `AdminVerificationsPage.jsx` and connect to routes + sidebar.
8. **Testing**
   - Scenario 1: New worker uploads NIC → status `SUBMITTED` → admin approves → worker becomes bookable.
   - Scenario 2: Admin rejects with reason → worker sees `REJECTED` and re-uploads → status returns to `SUBMITTED`.
   - Scenario 3: Attempt booking unverified worker → API returns clear error and UI blocks action.
