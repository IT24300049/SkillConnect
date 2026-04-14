# SkillConnect — 100% Full Website Implementation Plan
### IT2150: IT Project | Group: ITP_SE_01 | SLIIT Year 2, Sem 2
**Stack:** Spring Boot 3 (Java 21) + MySQL + React 18 + Vite + Tailwind CSS  
**Backend Port:** 8083 | **Frontend Port:** 5173  
**Last Updated:** February 25, 2026

---

> ⚠️ **This is NOT the 35% partial plan.** This document defines the entire, complete, production-ready website. Every page, every feature, every API endpoint, every database table.

---

## 🧭 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                 │
│  Public Pages: Landing, Login, Register                  │
│  Protected Pages: Dashboard, Workers, Jobs, Bookings,    │
│                   Reviews, Equipment, Messages, Profile   │
│  Admin Pages: Users, Complaints, Reports                  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST API (JWT Bearer)
┌────────────────────────▼────────────────────────────────┐
│              Spring Boot Backend (Port 8083)             │
│  Auth → Workers → Jobs → Bookings → Reviews → Equipment  │
│  Complaints → Messages → Admin → Notifications           │
└────────────────────────┬────────────────────────────────┘
                         │ JPA / Hibernate
┌────────────────────────▼────────────────────────────────┐
│              MySQL Database: skilled_worker_booking      │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Permissions

| Role | Can Do |
|------|--------|
| **Guest** | View landing page, browse public worker/job listings |
| **Customer** | Book workers, post jobs, rent equipment, leave reviews, message workers, file complaints |
| **Worker** | Accept/reject bookings, respond to reviews, message customers, view job postings |
| **Supplier** | Manage equipment inventory, view equipment rentals |
| **Admin** | Manage all users, moderate complaints, view analytics, promote roles |

---

## 🗄️ DATABASE — Complete Schema (100%)

### Tables & Status

| Table | Status | Purpose |
|-------|--------|---------|
| `users` | ✅ Done | Core user account |
| `customer_profiles` | ✅ Done | Customer-specific data |
| `worker_profiles` | ✅ Done | Skills, district, rate |
| `supplier_profiles` | ✅ Done | Business name, contact |
| `password_recovery` | ✅ Done | Reset tokens |
| `job_categories` | ✅ Done | 15 categories seeded |
| `jobs` | ✅ Done | Job postings |
| `job_applications` | ❌ Missing | Workers applying to jobs |
| `bookings` | ✅ Done | Service bookings |
| `booking_status_history` | ✅ Done | Status audit trail |
| `reviews` | ✅ Done | Worker ratings |
| `complaints` | ✅ Done | Dispute submissions |
| `messages` | ✅ Done | Chat messages |
| `message_threads` | ✅ Done | Chat threads |
| `equipment_categories` | ✅ Done (needs seed) | Equipment categories |
| `equipment_inventory` | ✅ Done | Equipment items |
| `equipment_bookings` | ✅ Done | Equipment rentals |
| `notifications` | ❌ Missing | In-app notifications |
| `worker_availability` | ❌ Missing | Worker schedule |

### New Tables to Add

```sql
-- Job Applications (Member 2 backend addition)
CREATE TABLE job_applications (
    application_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_id BIGINT NOT NULL REFERENCES jobs(job_id),
    worker_user_id BIGINT NOT NULL REFERENCES users(user_id),
    cover_note TEXT,
    proposed_price DECIMAL(10,2),
    status ENUM('pending','accepted','rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications (Shared - Admin assigns)
CREATE TABLE notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker Availability (Member 3 backend addition)
CREATE TABLE worker_availability (
    availability_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    worker_user_id BIGINT NOT NULL REFERENCES users(user_id),
    day_of_week ENUM('MON','TUE','WED','THU','FRI','SAT','SUN'),
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE
);
```

---

## ⚙️ BACKEND — Complete API Specification (100%)

### AUTH APIs (`/api/auth`) — Member 1
| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| POST | `/api/auth/register` | Public | Register new user + create profile | ✅ |
| POST | `/api/auth/login` | Public | Login, returns JWT token | ✅ |
| POST | `/api/auth/google` | Public | Google OAuth2 login | ✅ |
| POST | `/api/auth/forgot-password` | Public | Send reset token | ✅ |
| POST | `/api/auth/reset-password` | Public | Reset with token | ✅ |
| GET | `/api/auth/me` | 🔒 Auth | Get current user info | ❌ Add |

### USER/WORKER PROFILE APIs (`/api/workers`, `/api/profile`) — Member 1
| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | `/api/workers` | Public | List all workers (filter: district, skill, rating) | ✅ |
| GET | `/api/workers/{id}` | Public | Worker public profile + reviews | ✅ |
| GET | `/api/workers/me` | 🔒 Worker | My worker profile | ✅ |
| PUT | `/api/workers/me` | 🔒 Worker | Update my worker profile (bio, skills, rate, district) | ✅ |
| DELETE | `/api/workers/me` | 🔒 Worker | Delete my account | ✅ |
| GET | `/api/profile/me` | 🔒 Auth | Get any role's own profile | ❌ Add |
| PUT | `/api/profile/me` | 🔒 Auth | Update any role's own profile | ❌ Add |
| POST | `/api/profile/avatar` | 🔒 Auth | Upload profile picture (URL-based) | ❌ Add |
| GET | `/api/workers/admin/users` | 🔒 Admin | List ALL users | ✅ |
| PATCH | `/api/workers/admin/users/{id}/toggle` | 🔒 Admin | Activate/Suspend user | ✅ |
| PATCH | `/api/workers/admin/users/{id}/role` | 🔒 Admin | Change user role | ❌ Add |

### JOB POSTING APIs (`/api/jobs`) — Member 2
| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | `/api/jobs` | Public | List jobs (filter: category, district, status, search) | ✅ |
| GET | `/api/jobs/{id}` | Public | Job details | ✅ |
| GET | `/api/jobs/my` | 🔒 Customer | My posted jobs | ✅ |
| POST | `/api/jobs` | 🔒 Customer | Create job | ✅ |
| PUT | `/api/jobs/{id}` | 🔒 Customer | Update my job | ✅ |
| DELETE | `/api/jobs/{id}` | 🔒 Customer | Delete my job | ✅ |
| GET | `/api/jobs/categories` | Public | List all job categories | ✅ |
| POST | `/api/jobs/{id}/apply` | 🔒 Worker | Apply to a job | ❌ Add |
| GET | `/api/jobs/{id}/applications` | 🔒 Customer | View applications for my job | ❌ Add |
| PATCH | `/api/jobs/{id}/applications/{appId}` | 🔒 Customer | Accept/Reject applicant | ❌ Add |
| GET | `/api/jobs/applied` | 🔒 Worker | Jobs I applied to | ❌ Add |
| PATCH | `/api/jobs/{id}/status` | 🔒 Customer | Open / Close / Complete job | ❌ Add |

### BOOKING APIs (`/api/bookings`) — Member 3
| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| POST | `/api/bookings` | 🔒 Customer | Create booking (worker + date + notes) | ✅ |
| GET | `/api/bookings` | 🔒 Admin | All bookings (admin) | ✅ |
| GET | `/api/bookings/my` | 🔒 Auth | My bookings (as customer or worker) | ✅ |
| GET | `/api/bookings/{id}` | 🔒 Auth | Booking details | ✅ |
| PUT | `/api/bookings/{id}` | 🔒 Auth | Update booking details | ✅ |
| DELETE | `/api/bookings/{id}` | 🔒 Auth | Cancel/delete booking | ✅ |
| PATCH | `/api/bookings/{id}/status` | 🔒 Auth | Change status with reason | ✅ |
| GET | `/api/bookings/{id}/history` | 🔒 Auth | Status change history timeline | ✅ |
| GET | `/api/bookings/stats` | 🔒 Admin | Booking statistics | ❌ Add |

### REVIEW & COMPLAINT APIs (`/api/reviews`, `/api/complaints`) — Member 4
| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| POST | `/api/reviews` | 🔒 Customer | Submit review (after completed booking) | ✅ |
| GET | `/api/reviews/worker/{id}` | Public | Reviews for a worker | ✅ |
| GET | `/api/reviews` | 🔒 Admin | All reviews | ✅ |
| GET | `/api/reviews/my` | 🔒 Auth | Reviews I wrote | ❌ Add |
| PUT | `/api/reviews/{id}` | 🔒 Customer | Edit own review | ✅ |
| DELETE | `/api/reviews/{id}` | 🔒 Auth | Delete review (own or admin) | ✅ |
| POST | `/api/complaints` | 🔒 Customer | Submit complaint | ✅ |
| GET | `/api/complaints` | 🔒 Admin | All complaints | ✅ |
| GET | `/api/complaints/my` | 🔒 Customer | My complaints | ❌ Add |
| PATCH | `/api/complaints/{id}/status` | 🔒 Admin | Update complaint status | ✅ |
| DELETE | `/api/complaints/{id}` | 🔒 Admin | Delete complaint | ✅ |

### MESSAGING APIs (`/api/messages`) — Member 4
| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| POST | `/api/messages/threads` | 🔒 Auth | Create message thread | ✅ |
| GET | `/api/messages/threads` | 🔒 Auth | My threads | ✅ |
| GET | `/api/messages/threads/{id}` | 🔒 Auth | Thread messages | ✅ |
| POST | `/api/messages` | 🔒 Auth | Send a message | ✅ |
| GET | `/api/messages/unread-count` | 🔒 Auth | Unread message count | ❌ Add |

### EQUIPMENT APIs (`/api/equipment`) — Member 5
| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | `/api/equipment` | Public | Available equipment (filter: category) | ✅ |
| GET | `/api/equipment/all` | 🔒 Admin | All equipment incl. unavailable | ✅ |
| GET | `/api/equipment/{id}` | Public | Equipment details | ✅ |
| POST | `/api/equipment` | 🔒 Supplier | Add equipment | ✅ |
| PUT | `/api/equipment/{id}` | 🔒 Supplier | Update equipment | ✅ |
| DELETE | `/api/equipment/{id}` | 🔒 Supplier | Delete equipment | ✅ |
| GET | `/api/equipment/categories` | Public | Equipment categories | ✅ |
| POST | `/api/equipment/book` | 🔒 Auth | Book equipment (date range) | ✅ |
| GET | `/api/equipment/my-bookings` | 🔒 Auth | My equipment rentals | ✅ |
| POST | `/api/equipment/bookings/{id}/return` | 🔒 Auth | Return equipment | ✅ |
| GET | `/api/equipment/bookings/{id}/late-fee` | 🔒 Auth | Calculate late fee | ✅ |
| GET | `/api/equipment/supplier/mine` | 🔒 Supplier | My equipment items | ❌ Add |

### NOTIFICATIONS API (`/api/notifications`) — Shared
| Method | Endpoint | Auth | Description | Status |
|--------|----------|------|-------------|--------|
| GET | `/api/notifications` | 🔒 Auth | My notifications | ❌ Add |
| PATCH | `/api/notifications/{id}/read` | 🔒 Auth | Mark as read | ❌ Add |
| PATCH | `/api/notifications/read-all` | 🔒 Auth | Mark all as read | ❌ Add |

---

## 🖥️ FRONTEND — Complete Page & Component List (100%)

### Install React Router v6 First
```bash
npm install react-router-dom
```
Replace current `useState` navigation in `App.jsx` with proper URL routing.

---

### URL Routing Map

| URL | Page | Access |
|-----|------|--------|
| `/` | `LandingPage` | Public |
| `/login` | `LoginPage` | Public (redirect if logged in) |
| `/register` | `RegisterPage` | Public |
| `/dashboard` | `Dashboard` | 🔒 All roles |
| `/workers` | `WorkersPage` | 🔒 All |
| `/workers/:id` | `WorkerDetailPage` | 🔒 All |
| `/jobs` | `JobsPage` | 🔒 All |
| `/jobs/:id` | `JobDetailPage` | 🔒 All |
| `/bookings` | `BookingsPage` | 🔒 All |
| `/bookings/:id` | `BookingDetailPage` | 🔒 All |
| `/equipment` | `EquipmentPage` | 🔒 All |
| `/equipment/:id` | `EquipmentDetailPage` | 🔒 All |
| `/reviews` | `ReviewsPage` | 🔒 All |
| `/complaints` | `ComplaintsPage` | 🔒 All |
| `/messages` | `MessagesPage` | 🔒 All |
| `/messages/:threadId` | `MessagesPage` (selected thread) | 🔒 All |
| `/profile` | `ProfilePage` | 🔒 All |
| `/admin/users` | `AdminUsersPage` | 🔒 Admin |
| `/admin/complaints` | `AdminComplaintsPage` | 🔒 Admin |
| `/admin/reports` | `AdminReportsPage` | 🔒 Admin |
| `*` | `NotFoundPage` | Public |

---

## 📄 PAGE-BY-PAGE FULL SPECIFICATION

---

### 1. 🏠 LandingPage (PUBLIC — NEW)
**File:** `src/pages/LandingPage.jsx`  
**Purpose:** Marketing page for unauthenticated visitors

**Sections:**
- **Hero:** "Find Trusted Skilled Workers Near You" headline, search bar (location + category), CTA buttons: "Find a Worker" → `/login`, "Register Free" → `/register`
- **How It Works:** 3 steps with icons — Post a Job → Connect with Worker → Get It Done
- **Browse Categories:** 6 category cards (Electrical, Plumbing, Carpentry, Painting, HVAC, Cleaning) — click navigates to `/workers?category=...`
- **Platform Stats:** Animated counters — Total Workers, Total Jobs Posted, Happy Customers, Equipment Available
- **Featured Workers:** 3 worker cards (name, skill, rating, district) — fetched from public `/api/workers` endpoint
- **Testimonials:** 3 quote cards from fictional satisfied customers
- **How to Join:** 3 role tabs — As Customer / As Worker / As Supplier
- **CTA Banner:** "Ready to get started?" + Register button
- **Footer:** Logo, links, copyright

---

### 2. 🔐 LoginPage (EXISTS — Enhance)
**File:** `src/pages/LoginPage.jsx`  
**Changes:**
- Better visual layout consistent with Landing page branding
- Auto-redirect if already logged in (`useNavigate`)
- Google login: set `VITE_GOOGLE_CLIENT_ID` in `.env`
- Show "Forgot password" inline (not separate page)

---

### 3. 📋 RegisterPage (EXISTS — Enhance)
**File:** `src/pages/RegisterPage.jsx`  
**Changes:**
- Role selection as styled radio cards (not plain dropdown)
- **Customer fields:** First name, last name, phone, district
- **Worker fields:** + Skills (multi-select tag input), hourly rate, years of experience, bio
- **Supplier fields:** + Business name, contact person, address
- Password strength indicator
- Google register option

---

### 4. 📊 Dashboard (EXISTS — Enhance)
**File:** `src/pages/Dashboard.jsx`  
**Changes:**
- Role-specific welcome: show name from profile, not just email prefix
- Stats cards with real numbers (already exists, refine API)
- **Customer dashboard extras:** Active bookings, pending payments
- **Worker dashboard extras:** Incoming booking requests (show count as badge), avg rating
- **Supplier dashboard extras:** Equipment rented out count, overdue returns count
- **Admin dashboard extras:** Total users, open complaints, bookings today
- Recent activity feed showing last 5 actions (bookings, reviews, messages)

---

### 5. 👷 WorkersPage (EXISTS — Major Redesign)
**File:** `src/pages/WorkersPage.jsx`  
**Layout:** Split — Left: Filter Panel, Right: Worker Grid

**Filter Panel:**
- Skill / Job Category (multi-select from job categories)
- District (dropdown — all Sri Lanka districts)
- Minimum Rating (star filter: 3+, 4+, 4.5+)
- Max Hourly Rate (slider: Rs. 0 – Rs. 10,000)
- Availability (checkbox: Available Now)
- Search field (name or skill keyword)

**Worker Card:**
- Avatar / initials circle
- Full name, district
- Top 3 skills as chips
- Avg star rating + review count
- Hourly rate
- "View Profile" button → `/workers/:id`

---

### 6. 👤 WorkerDetailPage (NEW)
**File:** `src/pages/WorkerDetailPage.jsx`  
**Route:** `/workers/:id`

**Sections:**
- Profile header: avatar, name, district, member since, avg rating badge
- Bio / about section
- Skills list with category tags
- Hourly rate display
- Availability schedule (grid: Mon–Sun)
- **Reviews section:** list of all reviews with stars, comment, reviewer name, date
- Avg rating breakdown (quality, punctuality, professionalism stars)
- **Sidebar:** "Book This Worker" button → opens booking modal (date, time, notes, job selection)
- **Message Worker** button → creates new thread or navigates to existing `/messages`

---

### 7. 💼 JobsPage (EXISTS — Major Redesign)
**File:** `src/pages/JobsPage.jsx`  
**Tabs:** All Jobs | My Jobs (Customer) | Applied Jobs (Worker)

**Filter Bar:**
- Category dropdown
- District dropdown
- Status filter (open, in-progress, completed)
- Budget range (min/max input)
- Date posted (today, this week, this month)
- Search keyword

**Job Card:**
- Title, category badge, district badge
- Budget display (Rs. range)
- Urgency badge (Emergency 🔴 / Urgent 🟡 / Standard 🟢)
- Description snippet (2 lines)
- Posted date + applicant count
- "View Details" → `/jobs/:id`
- "Apply Now" button (workers only, if status = open)

**"Post a Job" button (customers):**
Opens a modal with:
- Title, Description (textarea)
- Category dropdown (from API)
- District, Urgency level
- Budget min/max
- Required date
- Special notes

---

### 8. 📋 JobDetailPage (NEW)
**File:** `src/pages/JobDetailPage.jsx`  
**Route:** `/jobs/:id`

**Customer View:**
- Full job details
- Status badge + actions (Edit, Delete, Close Job)
- Applicants list: worker name, rating, proposed price, cover note
- Accept / Reject buttons per applicant
- Accepted applicant shown with booking creation prompt

**Worker View:**
- Full job details
- "Apply" form: cover note, proposed price
- After applying: shows "Application Pending"

---

### 9. 📅 BookingsPage (EXISTS — Major Redesign)
**File:** `src/pages/BookingsPage.jsx`  
**Tabs:** Upcoming | Pending | Completed | Cancelled

**Customer Tab:**
- Card per booking: worker name, booking date, service, status badge
- "View Details" → `/bookings/:id`
- "Cancel" button (if status = pending/accepted)
- "Leave Review" button (if status = completed and no review yet)

**Worker Tab:**
- Incoming requests in card format
- Accept / Reject buttons with optional note
- Upcoming accepted bookings list

**Equipment Rental Sub-Tab:**
- Active rentals: equipment name, rent start/end, daily rate, status
- Overdue warning with late fee amount
- "Return Now" button

---

### 10. 📄 BookingDetailPage (NEW)
**File:** `src/pages/BookingDetailPage.jsx`  
**Route:** `/bookings/:id`

**Sections:**
- Booking summary card (worker/customer, date, service, price)
- Status badge (colour coded)
- **Status Timeline:** vertical steps showing all status changes with timestamps and reasons
- Contact worker/customer button → opens message thread
- Action buttons based on role + current status:
  - Customer: Cancel (pending), Leave Review (completed)
  - Worker: Accept, Reject (pending), Mark Complete (accepted)
- Equipment booking summary (if applicable): item, rental period, late fee

---

### 11. ⭐ ReviewsPage (EXISTS — Major Redesign)
**File:** `src/pages/ReviewsPage.jsx`  
**Tabs:** Leave a Review | My Reviews | Reviews About Me (Workers) | All Reviews (Admin)

**Leave a Review Tab (Customer):**
- "Select a completed booking" dropdown (only completed bookings with no review)
- Star rating inputs: Overall, Quality, Punctuality, Professionalism (1–5)
- Review comment textarea
- Submit button

**My Reviews Tab:**
- List of reviews written by me
- Edit / Delete options
- Review card: worker name, stars, comment, date

**Reviews About Me Tab (Worker only):**
- Average rating breakdown (per aspect)
- List of all reviews received: reviewer name, stars, comment, date

**All Reviews (Admin):**
- Table: reviewer, worker, rating, comment, date, delete action

---

### 12. 📢 ComplaintsPage (NEW)
**File:** `src/pages/ComplaintsPage.jsx`  
**Route:** `/complaints`

**Customer View:**
- Submit complaint form:
  - Related booking (dropdown)
  - Complaint category (Worker behavior, No-show, Equipment damage, etc.)
  - Description textarea
  - Upload screenshots URL (optional)
- My complaints history: status badge (open → investigating → resolved → closed)

**Admin View:**
- Table of all complaints
- Filter: status, date range, category
- Row actions: View Detail, Update Status (dropdown), Delete
- Complaint detail: full description, related booking info, resolution notes field

---

### 13. 💬 MessagesPage (NEW)
**File:** `src/pages/MessagesPage.jsx`  
**Route:** `/messages`

**Layout:** Two-panel (desktop) / Tab view (mobile)
- **Left Panel:** Thread list — user name, last message snippet, unread badge, timestamp
- **Right Panel:** Active thread messages
  - Messages as chat bubbles (mine right, theirs left)
  - Timestamp on hover
  - Scroll to bottom on new message
  - Text input + Send button
  - Re-poll every 5 seconds for new messages

**Start New Thread:** "New Message" button → search user by name → start thread

---

### 14. 🔧 EquipmentPage (EXISTS — Major Redesign)
**File:** `src/pages/EquipmentPage.jsx`  
**Tabs:** Browse Equipment | My Rentals | Manage Inventory (Supplier only)

**Browse Equipment Tab:**
- Category filter sidebar (14 categories from DB)
- Equipment grid: image/icon, name, category, daily rate, deposit, availability badge
- "Book" button → opens date range modal
- Booking modal: start date, end date, total cost calculation, quantity picker, confirm

**My Rentals Tab:**
- Active/upcoming rentals: equipment name, rental period, status
- "Return" button
- Late fee preview if overdue
- Past rentals history

**Manage Inventory Tab (Supplier only):**
- My equipment list: name, category, rate, quantity available, status
- "Add Equipment" form: name, category, description, daily rate, deposit, quantity, image URL
- Edit / Delete own equipment
- Bookings for each item (view only)

---

### 15. 🆕 EquipmentDetailPage (NEW)
**File:** `src/pages/EquipmentDetailPage.jsx`  
**Route:** `/equipment/:id`

- Equipment image, name, category
- Description
- Daily rate + deposit amount
- Availability status (Available / Fully Booked / Maintenance)
- Supplier info: business name, contact
- "Book Now" button → opens booking modal
- Current & upcoming bookings (for supplier view)

---

### 16. 👤 ProfilePage (NEW — All Roles)
**File:** `src/pages/ProfilePage.jsx`  
**Route:** `/profile`

**Customer Profile Section:**
- View/edit: First name, last name, phone, district, email
- Change password form (current + new + confirm)
- Delete account button

**Worker Profile Section:**
- View/edit: Name, phone, district, bio
- Skills list (add/remove skill tags)
- Hourly rate, years of experience
- Availability schedule editor
- View my average rating
- View all bookings made with me

**Supplier Profile Section:**
- Business name, contact person, address
- Equipment count, active rentals count

---

### 17. 🛡️ AdminUsersPage (EXISTS — Enhance)
**File:** `src/pages/AdminUsersPage.jsx`  
**Improvements:**
- Sortable table: email, role, status, join date, last login
- Role filter dropdown (all / customer / worker / supplier / admin)
- Status filter (active / suspended)
- Row actions: Activate, Suspend, Change Role, View Profile
- Confirmation modal before Suspend action
- Export CSV button

---

### 18. 🛡️ AdminComplaintsPage (NEW)
**File:** `src/pages/AdminComplaintsPage.jsx`  
**Route:** `/admin/complaints`

- Table: date, customer name, worker name, category, status, action
- Filter: status, date range
- "View" modal: full complaint details + resolution notes input
- Status update: Open → Investigating → Resolved → Closed

---

### 19. 📊 AdminReportsPage (NEW)
**File:** `src/pages/AdminReportsPage.jsx`  
**Route:** `/admin/reports`

- **Bar Chart:** Bookings by month (last 12 months)
- **Pie Chart:** Booking statuses distribution
- **Stats Cards:** Total users, total revenue, total bookings, avg rating
- **Top Workers table:** by rating + booking count
- **Equipment:** Most rented items table
- Library: `recharts` (install: `npm install recharts`)

---

## 🧩 SHARED COMPONENTS (All New)

| Component | File | Purpose |
|-----------|------|---------|
| `Navbar` | `components/Navbar.jsx` | Upgrade: avatar, notification bell, mobile menu |
| `Footer` | `components/Footer.jsx` | Site footer for all pages |
| `Toast` | `components/Toast.jsx` | Success/error global notification |
| `Modal` | `components/Modal.jsx` | Reusable modal wrapper |
| `ConfirmDialog` | `components/ConfirmDialog.jsx` | "Are you sure?" delete confirm |
| `Skeleton` | `components/Skeleton.jsx` | Loading placeholders |
| `StarRating` | `components/StarRating.jsx` | Clickable + display star input |
| `StatusBadge` | `components/StatusBadge.jsx` | Colour-coded status pill |
| `EmptyState` | `components/EmptyState.jsx` | Illustrated empty list state |
| `Pagination` | `components/Pagination.jsx` | Page navigation for lists |
| `DateRangePicker` | `components/DateRangePicker.jsx` | Equipment booking date selector |
| `DistrictSelect` | `components/DistrictSelect.jsx` | All Sri Lanka districts dropdown |
| `NotFoundPage` | `pages/NotFoundPage.jsx` | 404 page |
| `LoadingPage` | `pages/LoadingPage.jsx` | Full-screen loading spinner |
| `ProtectedRoute` | `components/ProtectedRoute.jsx` | Route guard (requires auth + optional role) |

---

## 🎨 DESIGN SYSTEM

**Color Palette:**
```css
--primary:    #4F46E5  /* Indigo 600 */
--primary-dark: #4338CA
--success:    #10B981  /* Emerald */
--warning:    #F59E0B  /* Amber */
--danger:     #EF4444  /* Red */
--surface:    #F8FAFC  /* Slate 50 */
--card:       #FFFFFF
--border:     #E2E8F0  /* Slate 200 */
--text-main:  #1E293B  /* Slate 800 */
--text-muted: #64748B  /* Slate 500 */
```

**Typography:** Google Fonts — `Inter` (already in use via Tailwind)

**Spacing:** Tailwind standard (4px grid)

**Status Badge Colors:**
| Status | Color |
|--------|-------|
| pending / open | Yellow |
| accepted / investigating | Blue |
| completed / resolved | Green |
| cancelled / rejected / closed | Red |
| rented / in-progress | Purple |

---

## 📦 NPM PACKAGES TO INSTALL

```bash
# Routing
npm install react-router-dom

# Charts (for Admin Reports)
npm install recharts

# Date pickers
npm install react-datepicker

# Icon library
npm install lucide-react

# Toast notifications
npm install react-hot-toast
```

---

## 🔄 COMPLETE IMPLEMENTATION PHASES

### Phase 1 — Foundation (Shared)
- [ ] Install `react-router-dom`, `react-hot-toast`, `lucide-react`
- [ ] Rewrite `App.jsx` with `<BrowserRouter>` + all routes
- [ ] Create `ProtectedRoute.jsx` (redirect to `/login` if no token)
- [ ] Create `Toast.jsx` global notification (wrap app in `<Toaster />`)
- [ ] Create `Modal.jsx`, `ConfirmDialog.jsx`, `Skeleton.jsx`
- [ ] Create `StatusBadge.jsx`, `EmptyState.jsx`
- [ ] Upgrade `Navbar.jsx` (notification bell, avatar, mobile hamburger)
- [ ] Create `Footer.jsx`
- [ ] Create `NotFoundPage.jsx` (404)
- [ ] Create `DistrictSelect.jsx` (all 25 districts as a reusable component)

### Phase 2 — Public Pages
- [ ] `LandingPage.jsx` — hero, how it works, categories, stats, footer
- [ ] Update `LoginPage.jsx` — use `useNavigate`, link to `/register`
- [ ] Update `RegisterPage.jsx` — role cards, role-specific fields, `useNavigate`

### Phase 3 — Member 1: User Management
**Backend:**
- [ ] `GET /api/auth/me` — return current user info (name, role, email)
- [ ] `GET /api/profile/me` — unified endpoint for any role's profile
- [ ] `PUT /api/profile/me` — update profile (delegates to worker/customer/supplier service)
- [ ] `PATCH /api/workers/admin/users/{id}/role` — admin change user role

**Frontend:**
- [ ] `ProfilePage.jsx` — view & edit profile, change password, delete account
- [ ] `WorkersPage.jsx` redesign — filter panel + worker cards grid
- [ ] `WorkerDetailPage.jsx` — full profile, reviews, book now, message

### Phase 4 — Member 2: Job Posting
**Backend:**
- [ ] `JobApplication.java` entity + `JobApplicationRepository`
- [ ] `POST /api/jobs/{id}/apply` — worker applies
- [ ] `GET /api/jobs/{id}/applications` — application list for customer
- [ ] `PATCH /api/jobs/{id}/applications/{appId}` — accept/reject applicant
- [ ] `GET /api/jobs/applied` — jobs worker applied to
- [ ] `PATCH /api/jobs/{id}/status` — change job status

**Frontend:**
- [ ] `JobsPage.jsx` redesign — tabs, filter bar, job cards, post modal
- [ ] `JobDetailPage.jsx` — customer & worker views, apply form, applicant list

### Phase 5 — Member 3: Booking Management
**Backend:**
- [ ] Booking conflict check (same worker, overlapping date/time)
- [ ] `GET /api/bookings/stats` — admin stats endpoint
- [ ] Auto-create notification on booking status change

**Frontend:**
- [ ] `BookingsPage.jsx` redesign — tabs, customer/worker views, equipment tab
- [ ] `BookingDetailPage.jsx` — status timeline, action buttons
- [ ] Booking creation modal on `WorkerDetailPage`

### Phase 6 — Member 4: Reviews, Complaints & Messaging
**Backend:**
- [ ] `GET /api/reviews/my` — reviews I wrote
- [ ] `GET /api/complaints/my` — my submitted complaints
- [ ] `GET /api/messages/unread-count` — for navbar badge

**Frontend:**
- [ ] `ReviewsPage.jsx` redesign — 4 tabs: leave, my, about me, admin
- [ ] `ComplaintsPage.jsx` — customer submit + admin manage
- [ ] `MessagesPage.jsx` — two-panel chat with 5-second polling

### Phase 7 — Member 5: Equipment Rental
**Backend:**
- [ ] `GET /api/equipment/supplier/mine` — supplier's own items
- [ ] Equipment availability validation before booking
- [ ] Run `equipment_categories_management.sql` to seed categories

**Frontend:**
- [ ] `EquipmentPage.jsx` redesign — 3 tabs: browse, my rentals, manage inventory
- [ ] `EquipmentDetailPage.jsx` — full details + book modal
- [ ] Install `react-datepicker` for date range selection

### Phase 8 — Admin Features
**Backend:**
- [ ] `NotificationController.java` — CRUD for notifications
- [ ] `GET /api/admin/stats` — dashboard stats for admin

**Frontend:**
- [ ] `AdminUsersPage.jsx` — sortable table, role filter, CSV export
- [ ] `AdminComplaintsPage.jsx` — full complaint management
- [ ] `AdminReportsPage.jsx` — recharts graphs
- [ ] Install `recharts`: `npm install recharts`

### Phase 9 — Polish & Final Integration
- [ ] `Skeleton.jsx` loading states on all pages
- [ ] `EmptyState.jsx` on all empty list states
- [ ] `Pagination.jsx` on Workers, Jobs, Equipment lists
- [ ] Mobile responsiveness check for ALL pages
- [ ] Error boundary component
- [ ] Test all user flows end-to-end (see Testing section below)

---

## 🧪 COMPLETE TESTING PLAN

### Backend Tests (Postman)

**CREATE A POSTMAN COLLECTION** with these folders:

```
Auth
  POST /api/auth/register → role=customer, worker, supplier
  POST /api/auth/login → get JWT token
  POST /api/auth/google → (skip if no Google client ID)
  POST /api/auth/forgot-password
  POST /api/auth/reset-password

Jobs
  GET /api/jobs (no auth)
  POST /api/jobs (customer JWT)
  GET /api/jobs/categories
  POST /api/jobs/{id}/apply (worker JWT)

Bookings
  POST /api/bookings (customer JWT)
  GET /api/bookings/my
  PATCH /api/bookings/{id}/status → status=accepted (worker JWT)
  PATCH /api/bookings/{id}/status → status=completed

Reviews
  POST /api/reviews (customer JWT, after completed booking)
  GET /api/reviews/worker/{workerId}

Equipment
  GET /api/equipment
  POST /api/equipment (supplier JWT)
  POST /api/equipment/book
  POST /api/equipment/bookings/{id}/return
```

### Frontend Manual Testing (Per Flow)

**Flow 1 — Customer Full Journey:**
1. Land on `/` → See landing page content
2. Click "Register" → Fill customer form → Redirect to `/dashboard`
3. Go to `/workers` → Apply filters → Click a worker → View profile
4. Click "Book This Worker" → Fill date/time/notes → Confirm
5. Go to `/bookings` → See booking in "Pending" tab
6. (Login as worker, accept booking)
7. Go back as customer → Booking in "Upcoming" tab → View details → Status timeline shows accepted
8. (Mark as completed as worker)
9. Go to `/reviews` → Leave a Review tab → Select booking → Rate 5★ → Submit
10. Go to `/messages` → See thread with worker → Send message

**Flow 2 — Worker Full Journey:**
1. Register as worker → Set skills, rate, district
2. Go to `/jobs` → Browse → Click "Apply Now" → Submit application
3. Go to `/bookings` → See incoming request → Accept it
4. Mark booking as completed
5. Go to `/reviews` → "Reviews About Me" tab → See customer's review

**Flow 3 — Supplier Equipment Flow:**
1. Register as supplier
2. Go to `/equipment` → "Manage Inventory" tab → "Add Equipment"
3. Fill: name, category, daily rate, deposit, quantity
4. (Login as customer) → Go to `/equipment` → Book the item → Confirm
5. (Back as supplier) → See booking in inventory tab

**Flow 4 — Admin Flow:**
1. Login as admin
2. Go to `/admin/users` → Suspend a user → Confirm
3. Go to `/admin/complaints` → View open complaints → Mark as "Investigating"
4. Go to `/admin/reports` → Verify charts load

---

## 🚀 DEPLOYMENT PLAN (Final Stage)

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel or Netlify | `npm run build` → deploy `dist/` |
| Backend | Railway.app or Render.com | Set env vars (DB URL, JWT secret) |
| Database | Railway MySQL (free tier) | Import `database_schema.sql` |

**Environment Variables:**

*Frontend `.env`:*
```
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

*Backend `application.properties` / env vars:*
```
DB_URL=jdbc:mysql://...
DB_USERNAME=...
DB_PASSWORD=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
CORS_ALLOWED_ORIGIN=https://your-frontend.vercel.app
MAIL_HOST=smtp.gmail.com (when real email is configured)
```

---

## 📊 PROGRESS TRACKER

Use this table to track completion per member:

| # | Feature | Backend | Frontend | Integrated | Tested |
|---|---------|---------|----------|------------|--------|
| 1 | Auth (register/login) | ✅ | ✅ | ✅ | ⬜ |
| 2 | Google Login | ✅ | ⚠️ (needs env var) | ⬜ | ⬜ |
| 3 | Forgot/Reset Password | ✅ | ✅ | ✅ | ⬜ |
| 4 | Worker Profile CRUD | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 5 | Customer Profile Page | ❌ | ❌ | ❌ | ❌ |
| 6 | Workers Browse + Filter | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 7 | Worker Detail Page | ✅ | ❌ | ❌ | ❌ |
| 8 | Job Posting CRUD | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 9 | Job Applications | ❌ | ❌ | ❌ | ❌ |
| 10 | Job Detail Page | ✅ | ❌ | ❌ | ❌ |
| 11 | Booking Create | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 12 | Booking Status Flow | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 13 | Booking Detail + Timeline | ✅ | ❌ | ❌ | ❌ |
| 14 | Reviews Submit | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 15 | Reviews Full UI | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 16 | Complaints System | ✅ | ❌ | ❌ | ❌ |
| 17 | Messaging | ✅ | ❌ | ❌ | ❌ |
| 18 | Equipment Browse | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 19 | Equipment Booking + Return | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 20 | Supplier Inventory Mgmt | ❌ | ❌ | ❌ | ❌ |
| 21 | Admin Users Manage | ✅ | ⚠️ basic | ⬜ | ⬜ |
| 22 | Admin Complaints Manage | ✅ | ❌ | ❌ | ❌ |
| 23 | Admin Reports/Charts | ❌ | ❌ | ❌ | ❌ |
| 24 | Notifications | ❌ | ❌ | ❌ | ❌ |
| 25 | Landing Page | ❌ | ❌ | ❌ | ❌ |
| 26 | React Router Navigation | — | ❌ | ❌ | ❌ |
| 27 | Mobile Responsive Design | — | ❌ | ❌ | ❌ |
| 28 | Deployment | — | ❌ | ❌ | ❌ |

**Legend:** ✅ Done | ⚠️ Partial | ❌ Not started | ⬜ Not checked

---

*This plan covers 100% of the SkillConnect website — every feature, page, API, and flow needed for a complete, production-ready submission.*  
*Document: ITP_SE_01 | Last Updated: February 25, 2026*
