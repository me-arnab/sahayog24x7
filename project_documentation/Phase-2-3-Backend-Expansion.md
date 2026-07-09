# Phase 2 and Phase 3 Backend Expansion Plan

## Scope Note

The current backend already supports the worker workflow:

- worker login
- assigned complaint listing
- complaint detail lookup
- start-work transition
- work report submission with file upload

This document focuses on the backend areas that are still not implemented for the citizen and admin experience in the React client.

---

## Phase 2 - Citizen Backend Foundation

### Goal

Build the backend required for citizen onboarding and complaint submission so the React `Register` and `UserDashboard` pages can move from mock data to real API calls.

### Pages That Depend on This Phase

- `client/src/pages/Register.tsx`
- `client/src/pages/Login.tsx` if citizen/admin login is added later
- `client/src/pages/UserDashboard.tsx`
- `client/src/pages/Home.tsx` for complaint entry points and CTA links

### APIs To Implement

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create a citizen account and store profile details |
| POST | `/api/auth/login` | No | Authenticate citizens or admins if role-based login is added |
| GET | `/api/auth/me` | JWT | Return the currently logged-in user profile |
| POST | `/api/complaints` | JWT | Create a new complaint for the logged-in citizen |
| GET | `/api/complaints/mine` | JWT | Return complaints created by the current citizen |
| GET | `/api/complaints/:id` | JWT | Return one complaint, limited to the owner or a privileged role |
| POST | `/api/complaints/:id/attachments` | JWT | Upload complaint photos or supporting files |

### Backend Work Required

1. Add a `User` or `Citizen` model with:
   - name
   - email
   - phone
   - consumerId
   - password hash
   - role

2. Extend authentication so the token includes:
   - user id
   - role
   - account type

3. Build complaint creation logic:
   - generate complaint IDs
   - save submitted form data
   - link the complaint to the logged-in user
   - support initial status such as `RECEIVED`

4. Add complaint visibility rules:
   - citizens can only read their own complaints
   - support filtering by status and date

5. Add attachment handling:
   - accept image uploads with `multer`
   - store file paths or URLs with the complaint record
   - validate file type and size

### Description Of This Phase

This phase replaces the current mock citizen experience with a real backend. The `Register` page stops being an alert-based form and becomes a genuine account creation flow. The `UserDashboard` becomes a real complaint center where a citizen can submit issues, see previous complaints, and check each complaint's status history.

### Expected Outcome

- citizens can create accounts
- citizens can sign in with JWT
- citizens can submit complaints to the API
- complaint records persist in MongoDB
- user dashboard data comes from the backend instead of local mock arrays

---

## Phase 3 - Admin Workflow And Operations Backend

### Goal

Build the backend required for admin complaint management so the React `AdminDashboard` page can manage the complaint lifecycle with real persistence, filtering, assignment, and resolution controls.

### Pages That Depend On This Phase

- `client/src/pages/AdminDashboard.tsx`
- `client/src/pages/UserDashboard.tsx` for real-time status updates
- `client/src/pages/WorkerDashboard.tsx` for assignment visibility and cross-role consistency

### APIs To Implement

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/admin/complaints` | Admin | Return all complaints with filter, search, and pagination support |
| GET | `/api/admin/complaints/:id` | Admin | Return the full detail view for one complaint |
| PUT | `/api/admin/complaints/:id/assign` | Admin | Assign or reassign a complaint to a worker or team |
| PUT | `/api/admin/complaints/:id/status` | Admin | Update complaint status such as `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, or `ESCALATED` |
| PUT | `/api/admin/complaints/:id/notes` | Admin | Save internal notes, escalation remarks, or resolution comments |
| GET | `/api/admin/stats` | Admin | Return dashboard counts and summary metrics |
| GET | `/api/admin/workers` | Admin | List workers for assignment dropdowns |
| POST | `/api/admin/workers/seed` | Admin | Create or seed worker accounts for testing |

### Backend Work Required

1. Add admin role support:
   - distinguish `ADMIN` and `CITIZEN` roles in the user model
   - protect admin routes with a role-check middleware

2. Add complaint administration logic:
   - assign complaints to workers or teams
   - change complaint state from one step to the next
   - prevent invalid status jumps
   - prevent edits after final resolution, unless the business rule allows reopening

3. Add dashboard querying support:
   - search by complaint ID, consumer name, consumer ID, or location
   - filter by status, zone, and assignment
   - support pagination for large complaint lists

4. Add summary metrics:
   - total complaints
   - open vs resolved counts
   - emergency counts for visibility only
   - worker workload counts
   - time-to-resolution averages if available

5. Add operational audit trails:
   - record who changed status
   - record who assigned the complaint
   - record when a complaint was escalated or resolved

### Description Of This Phase

This phase turns the admin dashboard into a working operations console instead of a mock table. The admin can search the complaint pool, view detailed records, assign work, track progress, and monitor performance metrics. It also creates the backend contract needed for future enhancements such as notifications, exports, and live updates.

### Expected Outcome

- admin users can manage the complaint lifecycle
- complaint state changes are persisted and traceable
- dashboard cards and charts are backed by real counts
- worker assignment becomes a backend-controlled workflow
- the mock admin page can be replaced with live data without changing the UI structure

---

## Shared Backend Changes For Both Phases

### Data Models

- `User` or `Citizen`
- `Complaint`
- `Worker`
- `WorkReport`
- optional `Notification`

### Middleware

- JWT authentication middleware
- admin-role authorization middleware
- file upload validation middleware
- request validation middleware

### Backend Services

- complaint ID generation
- password hashing
- notification trigger service
- file storage helper
- stats aggregation helper

### API Design Rules

1. Keep route groups separated by role:
   - `/api/auth`
   - `/api/complaints`
   - `/api/admin`
   - `/api/uploads`

2. Use clear state names:
   - `RECEIVED`
   - `ASSIGNED`
   - `IN_PROGRESS`
   - `RESOLVED`
   - `ESCALATED`

3. Return consistent response shapes:
   - `message`
   - `data`
   - `error`
   - `meta` for pagination

4. Validate ownership before reading or updating data:
   - citizens can only access their own complaints
   - workers can only access assigned complaints
   - admins can access all complaint records

---

## Recommended Build Order

1. Implement the citizen/auth models and register/login flow.
2. Wire complaint creation and complaint listing for the citizen dashboard.
3. Add admin routes for listing, filtering, and assignment.
4. Add admin metrics and audit details.
5. Connect the React pages to the new APIs.
6. Add integration tests for auth, complaint creation, assignment, and status changes.
