# Worker Job Acceptance + Customer Notification Plan

## 1. Objective
Enable workers to take action from Jobs flow (not just "View") and notify customers when a worker accepts/applies, including worker identity.

## 2. Project Analysis (Current State)

### Frontend
- `frontend/src/pages/JobsPage.jsx`
  - Workers currently only get a `View` button from the jobs list.
- `frontend/src/pages/JobDetailPage.jsx`
  - Workers can already submit an application (`jobAPI.apply`) via form.
  - Customers can accept/reject applications (`jobAPI.updateApplication`).
- `frontend/src/pages/BookingsPage.jsx`
  - Status transition buttons are shown broadly; role-specific restrictions are currently weak.
- `frontend/src/api.js`
  - APIs already exist for jobs applications and notifications.

### Backend
- `backend/src/main/java/com/itp/skilledworker/service/JobService.java`
  - `applyToJob(...)` creates pending worker application.
  - `updateApplicationStatus(...)` lets customer accept/reject.
  - No notification trigger in either method.
- `backend/src/main/java/com/itp/skilledworker/service/NotificationService.java`
  - Notification infrastructure exists (`createNotification`, read, unread count).
  - Not integrated into job/application workflow yet.
- `backend/src/main/java/com/itp/skilledworker/service/BookingService.java`
  - Booking status transitions exist but role authorization should be tightened in future.

## 3. Recommended Product Logic
Use existing "application" model as the acceptance intent from worker side.

### Why
- Avoids breaking core schema and state machine.
- Low-risk enhancement with existing APIs/entities.
- Meets requirement: workers can accept work; customer gets alerted with who accepted.

### Behavior
1. Worker can click **Accept Work** directly from Jobs list.
2. System creates a pending application for that worker/job (existing backend behavior).
3. Customer receives notification:
   - Title: `New worker acceptance`
   - Message includes worker name/email and job title.
   - Link points to job details applications section.
4. Customer accepts one worker from applications.
5. Optional second notification to accepted worker: `You were selected for <job>`.

## 4. Scope

### In Scope (Phase 1)
- Jobs list worker action: add `Accept Work` button.
- Backend notification on worker application creation.
- Backend notification on customer acceptance of application.
- Frontend notifications visibility (badge/list refresh) using existing notification API.

### Out of Scope (Phase 1)
- New DB tables.
- Real-time websocket push (polling/manual refresh is acceptable first).
- Full booking authorization refactor (track in Phase 2 hardening).

## 5. Detailed Implementation Plan

### Phase A: Backend Notification Integration

#### A1. Notify customer when worker applies
- File: `backend/src/main/java/com/itp/skilledworker/service/JobService.java`
- Change:
  - Inject `NotificationService`.
  - In `applyToJob(...)`, after saving application:
    - Resolve customer user from `job.getCustomer().getUser()`.
    - Create notification with worker identity and job title.
    - Add link URL to job detail route, e.g. `/jobs/{jobId}`.

#### A2. Notify worker when customer accepts application
- File: `backend/src/main/java/com/itp/skilledworker/service/JobService.java`
- Change:
  - In `updateApplicationStatus(...)`, when status becomes `accepted`:
    - Notify selected worker.
    - Optionally notify other pending applicants that job is no longer available.

#### A3. Message quality and consistency
- File: `backend/src/main/java/com/itp/skilledworker/service/JobService.java`
- Rules:
  - Keep consistent notification title prefixes.
  - Keep message clear and include actor + job title.

### Phase B: Worker Action from Jobs List

#### B1. Add Accept Work action in jobs cards
- File: `frontend/src/pages/JobsPage.jsx`
- Change:
  - For workers and active jobs not owned by them, show `Accept Work` button near `View`.
  - On click, call `jobAPI.apply(job.jobId, { coverNote: '', proposedPrice: null })` or open compact modal.

#### B2. Avoid duplicate accepts
- File: `frontend/src/pages/JobsPage.jsx`
- Change:
  - Track which jobs already applied by current worker.
  - Disable/change button text to `Accepted` if already applied.

### Phase C: Customer Notification Visibility

#### C1. Show unread badge and list refresh
- File: `frontend/src/components/Navbar.jsx` (or existing notifications UI component)
- Change:
  - Fetch unread count (`notificationAPI.getUnreadCount` if available; otherwise derive from `getAll`).
  - Add periodic refresh (e.g., every 15–30 seconds) while logged in.
  - Show latest notification items and mark-as-read actions.

#### C2. Deep link navigation
- Files:
  - `frontend/src/components/Navbar.jsx`
  - notification click routing target pages
- Change:
  - Clicking job-notification opens `/jobs/{jobId}`.

## 6. Validation Rules and Authorization

### Must enforce
1. Worker cannot accept/apply to own job.
2. Duplicate application blocked (already present backend check; keep).
3. Only customer owner can accept/reject applications (already present backend check; keep).
4. Notification creation must happen only after transactionally successful status/apply save.

## 7. Data and API Impact

### Database
- No schema change required in Phase 1.

### API
- No endpoint contract change required in Phase 1.
- Reuse existing:
  - `POST /api/jobs/{id}/apply`
  - `PATCH /api/jobs/{id}/applications/{appId}`
  - `GET /api/notifications`

## 8. Test Plan

### Backend tests
1. Worker apply -> application saved + customer notification saved.
2. Customer accepts application -> selected worker notification saved.
3. Duplicate apply -> rejected, no extra notification.
4. Non-owner customer attempting app status update -> rejected.

### Frontend tests
1. Worker sees `Accept Work` action on Jobs list.
2. Worker click accept -> UI updates to applied/accepted state.
3. Customer receives and sees notification entry with correct worker identity.
4. Notification link opens correct job detail page.

## 9. Rollout Steps
1. Implement backend notification integration first.
2. Implement worker list-level action in Jobs page.
3. Implement notification UI refresh.
4. Run end-to-end scenario:
   - Worker accepts from Jobs list.
   - Customer receives alert.
   - Customer accepts worker.
   - Worker receives selected notification.

## 10. Future Hardening (Phase 2)
1. Tighten booking status authorization in `BookingService.updateBookingStatus(...)`.
2. Add event-based notification architecture (domain events) to avoid service coupling.
3. Add websocket/SSE real-time notifications.
4. Add notification type enum usage and per-type filtering in UI.
