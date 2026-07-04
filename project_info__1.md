# Sahayog24x7 — Codebase Overview & Dynamic Migration Roadmap

## Part 1: Current State Analysis

### What This Project Is
Sahayog24x7 is a **static frontend-only prototype** for a citizen complaint management platform focused on electricity-related issues. It is meant to allow citizens to register, submit complaints about power outages / transformer faults / meter issues, and allow administrators to track, assign, and resolve those complaints.

### What Actually Exists Today

| Aspect | Current Implementation |
|--------|----------------------|
| **Frontend** | Plain HTML5 + CSS3 + Vanilla JavaScript |
| **Backend** | Empty shell — `backend/config/db.js` and `backend/src/routes/server.js` are completely empty |
| **Database** | None — all data is stored in in-memory JavaScript arrays (`allComplaints`, `currentUserComplaints`) |
| **Authentication** | Non-functional — login form in `index.html` does nothing; register form only does client-side validation and an `alert()` |
| **File Upload** | Input fields for photos exist in the complaint form but are never sent anywhere |
| **State Persistence** | Zero — every page reload resets mock data to the hardcoded 4 complaints |
| **Code Duplication** | `js/dashboard.js`, `js/userDashboard.js`, and `js/adminDashboard.js` are **~97% identical** (each ~400 lines, same mock data, same functions) |
| **Notifications** | In-browser simulated toast notification only — no email/SMS |
| **Real-Time** | None — admin has no way to see new complaints without manual refresh |
| **Deployment** | No server setup, no build step, no package.json |

### Current Data Model (Mock)
```js
{
  id: 'COMP-004',
  citizenName: 'Anita Devi',
  phone: '+91-9876543213',
  location: 'Ward 3, Sector 12',
  zone: 'ward-3',
  issueType: 'Meter Fault',
  description: 'Meter reading incorrect...',
  priority: 'low',                // high | medium | low
  status: 'resolved',             // received | in-progress | resolved | escalated
  createdAt: '2025-12-13T10:30:00',
  photoUrls: [],
  assignedTeam: 'Metering Unit',
  isNew: false
}
```

### Key Gaps & Non-Obvious Issues
1. **No user identification** — every page is publicly accessible; there is no concept of "my complaints vs all complaints"
2. **Simulated submissions** — form submission uses `setTimeout(1500)` and pushes to a local array, never hits a network endpoint
3. **Fake stats** — the live stats interval (`setInterval(5000)`) recalculates from client-side data that never changes except from the current session
4. **No error states** — if an API were connected, there are zero loading spinners, zero retry logic, zero network error handling
5. **Three identical dashboard files** — this will be a maintenance nightmare as functionality grows
6. **Empty backend directory** — the structure suggests a Node.js/Express intent but nothing was implemented
7. **Routes that don't link** — `dashboard.html` has a "Login" link that goes nowhere functional; `userDashboard.html` and `adminDashboard.html` exist as separate entry points but share the same code

---

## Part 2: Architecture (Current)

```
sahayog24x7/
├── index.html              # Landing page: hero, services slider, contact, footer, overlays
├── register.html           # Registration form (client-side only)
├── dashboard.html          # Combined user/admin dashboard with tab switch
├── userDashboard.html      # User-only dashboard (redundant)
├── adminDashboard.html     # Admin-only dashboard (redundant)
├── assets/                 # Logo, brand images, 10 service icons
├── style/
│   ├── style.css           # Base styles, navbar, hero, logo, floating buttons
│   ├── dashboard.css       # Dashboard layout, glass cards, complaint cards, modal
│   ├── register.css        # Registration page styles
│   ├── loginFloat.css      # Overlay and floating box (login/notice/FAQ)
│   ├── howItWorks.css      # 3-step card section
│   ├── ourServices.css     # Service icon circles slider
│   ├── miniTiles.css       # Hero mini tiles + glowing divider + blurs
│   ├── contact.css         # Contact section left/right layout
│   ├── footer.css          # Government-style footer columns
│   └── about.css           # About section (unused in navigation)
├── js/
│   ├── dashboard.js        # Full dashboard logic (mock CRUD, filters, modal, search)
│   ├── userDashboard.js    # Same as dashboard.js (user-only version)
│   ├── adminDashboard.js   # Same as dashboard.js (admin-only version)
│   ├── loginFloat.js       # Open/close overlay functions
│   └── ourServices.js      # Commented-out slider logic
├── backend/
│   ├── config/
│   │   └── db.js           # EMPTY
│   └── src/
│       └── routes/
│           └── server.js   # EMPTY
└── .gitignore              # Standard Node.js gitignore
```

### How the Mock "Data Flow" Works Today

```
User fills complaint form → preventDefault → setTimeout(1500ms) →
  create mock complaint object with random ID/priority →
  unshift to allComplaints[] array →
  re-render user complaints list →
  if admin tab open, re-render admin complaints too →
  show toast notification →
  after 10s, set isNew=false for that complaint
```

No data ever leaves the browser. Everything runs in-memory in a single session.

---

## Part 3: Dynamic Migration Plan

This is a phased roadmap to turn this static prototype into a fully functional, production-ready application.

### Phase 0: Project Setup & Tooling

| Step | Detail |
|------|--------|
| Initialize npm | `npm init -y` at `sahayog24x7/backend/` |
| Core dependencies | `express`, `mongoose` (or `pg` for PostgreSQL), `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `multer`, `socket.io` |
| Dev dependencies | `nodemon`, `eslint` |
| Create `.env` | `PORT`, `MONGODB_URI`, `JWT_SECRET`, `UPLOAD_DIR` |
| Update `.gitignore` | Ensure `node_modules/`, `.env`, `uploads/` are ignored |
| Define `package.json` scripts | `"start": "node server.js"`, `"dev": "nodemon server.js"` |

### Phase 1: Database Schema

#### MongoDB Collections (recommended for this use case)

**users**
```js
{
  _id: ObjectId,
  name: String,
  email: String,          // unique
  phone: String,
  consumerId: String,     // unique, e.g. "CON123456"
  password: String,       // bcrypt hashed
  role: String,           // "user" | "admin"
  createdAt: Date,
  updatedAt: Date
}
```

**complaints**
```js
{
  _id: ObjectId,
  complaintId: String,    // e.g. "COMP-001" (auto-increment or UUID)
  userId: ObjectId,       // reference to users._id (who created it)
  citizenName: String,
  phone: String,
  location: String,
  zone: String,           // "ward-1" through "ward-5"
  issueType: String,      // "Power Outage", "Low Voltage", etc.
  description: String,
  priority: String,       // "high" | "medium" | "low"
  status: String,         // "received" | "in-progress" | "resolved" | "escalated"
  photos: [String],       // array of file paths or URLs
  assignedTeam: String,   // nullable
  assignedBy: ObjectId,   // admin who assigned
  resolutionNotes: String,
  citizenRating: Number,  // 1-5
  createdAt: Date,
  updatedAt: Date
}
```

**notifications** (optional but recommended)
```js
{
  _id: ObjectId,
  userId: ObjectId,
  complaintId: ObjectId,
  message: String,
  read: Boolean,
  createdAt: Date
}
```

### Phase 2: Backend API Endpoints

**Auth Routes** (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create user account (hash password, return JWT) |
| POST | `/api/auth/login` | No | Verify credentials, return JWT + user info |
| GET | `/api/auth/me` | JWT | Return current user profile |

**Complaint Routes** (`/api/complaints`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/complaints` | User | Create new complaint (auto-assign `userId` from JWT) |
| GET | `/api/complaints` | User | Return own complaints; Admin returns all |
| GET | `/api/complaints/:id` | Any | Get single complaint details |
| PUT | `/api/complaints/:id` | Admin | Update status, assign team, add notes |
| DELETE | `/api/complaints/:id` | Admin | Soft-delete or remove complaint |
| GET | `/api/complaints/stats` | Admin | Return counts (total, open, by status, by zone) |
| PUT | `/api/complaints/:id/rate` | User | Submit rating (1-5) for resolved complaint |

**File Upload Routes** (`/api/uploads`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/uploads` | User | Upload one or multiple images (multer) |
| GET | `/api/uploads/:filename` | Any | Serve uploaded image |

**Notification Routes** (optional)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Any | Get user's notifications |
| PUT | `/api/notifications/:id/read` | Any | Mark as read |

### Phase 3: Authentication & Authorization Flow

```
REGISTER:
  Client sends { name, email, phone, consumerId, password }
  → Server hash password with bcrypt (salt rounds=10)
  → Save user to MongoDB (role defaults to "user")
  → Generate JWT { userId, role } with expiry (7d)
  → Return { token, user: { name, email, role } }

LOGIN:
  Client sends { email, password }
  → Server find user by email
  → Compare password with bcrypt.compare()
  → If match, generate JWT and return
  → If not, return 401

MIDDLEWARE:
  authMiddleware: verify JWT from Authorization: Bearer <token>
    → attach req.user = { userId, role }
    → if invalid/expired, return 401
  
  adminMiddleware: check req.user.role === 'admin'
    → if not, return 403

FRONTEND:
  Store token in localStorage
  On page load, check token validity by calling GET /api/auth/me
  If valid, show dashboard; if not, redirect to login
  Attach token to all API calls via axios interceptors
```

### Phase 4: Frontend Refactoring

**Step 1: Eliminate Code Duplication**
- Delete `js/userDashboard.js` and `js/adminDashboard.js`
- Keep only `js/dashboard.js` as the single source of truth
- Create `js/api.js` — shared API client (axios instance with base URL and auth interceptor)
- Create `js/auth.js` — login, register, logout, token management, route guarding

**Step 2: Replace Mock Data with Real API Calls**
- `submitComplaint()` → POST `/api/complaints`
- `loadUserComplaints()` → GET `/api/complaints` (with query `?userId=...`)
- `loadAdminComplaints()` → GET `/api/complaints` (admin sees all)
- `updateStatus()` → PUT `/api/complaints/:id`
- `assignTeam()` → PUT `/api/complaints/:id`
- `applyFilters()` → GET `/api/complaints` (with query params: `?status=...&priority=...&zone=...`)
- `searchComplaints()` → GET `/api/complaints?search=...`
- `getStats()` → GET `/api/complaints/stats`

**Step 3: Add Real Feedback UI**
- Loading spinners on every API call (replace disabled button with spinner)
- Error toast messages (network error, server error, validation error)
- Empty states (no complaints yet, no search results)

**Step 4: Conditional Dashboard Rendering**
- On dashboard load, decode JWT role
- If role === 'user': show user dashboard view, hide admin sidebar
- If role === 'admin': show admin dashboard view, show sidebar and all complaints
- Remove tab-switching between user/admin (let the backend determine what to show)

**Step 5: Fix File Upload**
- On file input change, immediately upload to POST `/api/uploads`
- Store returned URLs and attach to complaint creation
- Display uploaded photos in complaint detail modal

### Phase 5: Real-Time Updates with Socket.IO

```
BACKEND:
  const io = require('socket.io')(server, { cors: { origin: '*' } })
  io.on('connection', socket => {
    socket.on('join', ({ userId, role }) => {
      socket.join(role === 'admin' ? 'admin-room' : `user-${userId}`)
    })
  })

  // Whenever complaint is created/updated:
  io.to('admin-room').emit('new-complaint', complaint)
  io.to(`user-${complaint.userId}`).emit('status-change', complaint)

FRONTEND:
  const socket = io('http://localhost:5000')
  socket.emit('join', { userId, role })
  socket.on('new-complaint', complaint => { prependToList(complaint) })
  socket.on('status-change', complaint => { updateInList(complaint) })
```

### Phase 6: Advanced Features (Post-MVP)

| Feature | Implementation |
|---------|---------------|
| **Email Notifications** | Nodemailer — send email on complaint creation and status change |
| **SMS Alerts** | Twilio — send SMS to user phone on assignment/resolution |
| **Export to CSV** | Server endpoint that streams complaint data as CSV |
| **Dashboard Charts** | Chart.js or ApexCharts with real stats from API |
| **Pagination** | Server-side pagination with `page` and `limit` query params |
| **Image Cloud Storage** | Replace local multer with Cloudinary uploads |
| **Rate Limiting** | express-rate-limit on auth endpoints |
| **Input Sanitization** | express-validator for all POST/PUT requests |
| **OAuth Login** | Google/GitHub OAuth for citizen login |

---

## Part 4: Files That Need Modification (Complete List)

### Backend (New/Modified)
| File | Status | Action |
|------|--------|--------|
| `backend/package.json` | **NEW** | Create with dependencies |
| `backend/.env` | **NEW** | Environment variables |
| `backend/src/server.js` | **REPLACE** | Full Express setup with routes, middleware, socket.io |
| `backend/src/config/db.js` | **FILL** | MongoDB/Mongoose connection |
| `backend/src/models/User.js` | **NEW** | Mongoose user schema |
| `backend/src/models/Complaint.js` | **NEW** | Mongoose complaint schema |
| `backend/src/models/Notification.js` | **NEW** | Mongoose notification schema |
| `backend/src/routes/auth.js` | **NEW** | Register/login routes |
| `backend/src/routes/complaints.js` | **NEW** | CRUD + stats routes |
| `backend/src/routes/uploads.js` | **NEW** | File upload route |
| `backend/src/middleware/auth.js` | **NEW** | JWT verification middleware |
| `backend/src/middleware/admin.js` | **NEW** | Admin role check middleware |
| `backend/src/utils/generateId.js` | **NEW** | Auto-increment complaint ID helper |
| `backend/uploads/` | **NEW** | Directory for uploaded files |

### Frontend (Modified)
| File | Status | Action |
|------|--------|--------|
| `js/dashboard.js` | **REWRITE** | Remove mock data, replace with API calls via axios, add auth guards |
| `js/userDashboard.js` | **DELETE** | Consolidated into dashboard.js |
| `js/adminDashboard.js` | **DELETE** | Consolidated into dashboard.js |
| `js/api.js` | **NEW** | Shared axios instance with auth interceptor |
| `js/auth.js` | **NEW** | Login, register, token management, route guard |
| `index.html` | **MODIFY** | Login form submits to API, stores JWT, redirects; add registration link properly |
| `register.html` | **REWRITE** | Submit to POST /api/auth/register, handle response, redirect to dashboard |
| `dashboard.html` | **MODIFY** | Add auth check on load, conditionally show user vs admin content based on role |
| `userDashboard.html` | **DELETE** | Redirect to dashboard.html |
| `adminDashboard.html` | **DELETE** | Redirect to dashboard.html |
| `js/loginFloat.js` | **MODIFY** | Expand to handle form submit, loading states, error display |
| `style/dashboard.css` | **MODIFY** | Add CSS for loading spinners, error states, responsive improvements |

### Files That Can Stay As-Is
| File | Reason |
|------|--------|
| All `assets/*.png` | Static images, no changes needed |
| `style/style.css` | Landing page styles work fine |
| `style/register.css` | Minimal tweaks maybe, but functional |
| `style/loginFloat.css` | Works for overlay styling |
| `style/howItWorks.css` | Static section, no backend needed |
| `style/ourServices.css` | Static icon display |
| `style/miniTiles.css` | Hero section styling |
| `style/contact.css` | Contact form can be upgraded to send email |
| `style/footer.css` | Static footer |
| `style/about.css` | Not linked in nav, but no changes needed |
| `js/ourServices.js` | Commented out, not functionally used |
| `.gitignore` | Already comprehensive for Node.js |

---

## Part 5: Non-Obvious Design Decisions & Invariants

### What Must Stay True
1. **Complaint IDs must be unique and sequential** — currently mocked as `COMP-{random}`; in a real system, use a database auto-increment counter
2. **Admin assignment is one-way** — once a team is assigned, the current UI prevents reassignment; this business rule should be enforced on the backend too
3. **Resolved complaints are immutable** — no status changes or team assignments allowed after resolution; enforce both on frontend and backend
4. **Each complaint belongs to exactly one user** — the `userId` foreign key links it back; a user should only see their own complaints
5. **Priority is auto-assigned** — currently random; real system should derive priority from issue type (sparking/hazard → high) or let admin override
6. **Zones are fixed** — "Ward 1–5" exists; if the app scales, zones should come from a separate reference table

### Why The Current Architecture Is This Way
- **Static prototype** — the developer built a fully functional-looking UI to demonstrate the concept without backend complexity
- **Three duplicate JS files** — likely created separately during development and never merged, or intended as separate entry points for user vs admin (which the combined `dashboard.html` already solves with tabs)
- **Empty backend directory** — the project structure suggests the creator intended to add a backend later (Node.js/Express/MongoDB is the obvious choice given the folder layout)
- **No build step** — pure HTML/CSS/JS means it can be opened directly in a browser with no server, ideal for static hosting demos

### What Will Surprise A New Developer
1. **The "login" and "register" buttons don't actually work** — they only open/close overlays or show alerts
2. **Three dashboard files with identical code exist** — you must consolidate before building the real backend
3. **The contact form has no action URL** — it does nothing on submit
4. **The services slider JavaScript is commented out** — the images are displayed statically without slider behavior
5. **File uploads are declared in HTML but never read** — the JS never accesses the `FileList` from the input
6. **No package.json exists** — there is no dependency management at all
7. **The `about.css` file is never linked** — the About section exists in CSS but is not used anywhere in the HTML

---

## Part 6: Suggested Implementation Sequence

For a developer starting from zero, this is the recommended order:

1. **Read this document** — understand the full picture before touching code
2. **Read `js/dashboard.js`** — understand the existing data flow (even though it's mock)
3. **Set up backend foundation** — Express server, MongoDB connection, environment config
4. **Create database models** — User, Complaint, Notification schemas
5. **Implement auth endpoints** — register, login, JWT middleware
6. **Implement complaint CRUD endpoints** — create, read, update, stats
7. **Refactor frontend JS** — consolidate three files into one, add API calls
8. **Add auth to frontend** — login page, token storage, route guards
9. **Fix file upload** — multer backend + frontend upload on file select
10. **Add real-time updates** — Socket.IO for live dashboard
11. **Add notifications** — backend + frontend notification display
12. **Polish** — loading states, error handling, responsive fixes, export

---

## Module Reference (Current State)

| File | Purpose |
|------|---------|
| `index.html` | Landing page with hero, floating overlays (login/notice/FAQ), services, contact, footer |
| `register.html` | Registration form with client-side validation (simulated success) |
| `dashboard.html` | Combined user+admin dashboard with tab switcher, complaint form, modal, notification |
| `userDashboard.html` | User-only view (identical to dashboard.js logic) |
| `adminDashboard.html` | Admin-only view (identical to dashboard.js logic) |
| `js/dashboard.js` | Core dashboard logic: mock data, CRUD, filters, search, modal, notifications |
| `js/userDashboard.js` | Duplicate of dashboard.js |
| `js/adminDashboard.js` | Duplicate of dashboard.js |
| `js/loginFloat.js` | Opens/closes overlay boxes for login, notice, FAQ |
| `js/ourServices.js` | Commented-out slider logic (unused) |
| `style/style.css` | Base layout, navbar, hero, logo, floating buttons, responsive breakpoints |
| `style/dashboard.css` | Glassmorphism dashboard UI, stat cards, complaint cards, modal, search, responsive |
| `style/register.css` | Glossy glass registration form, backdrop blur, gradient background |
| `style/loginFloat.css` | Overlay + glass floating box for login/notice/FAQ modals |
| `style/howItWorks.css` | 3-column step cards with glass effect and hover glow |
| `style/ourServices.css` | Circular service icons in a row |
| `style/miniTiles.css` | Hero badges, glowing divided, orange/green blurs, hover effects |
| `style/contact.css` | Two-column contact section with form |
| `style/footer.css` | Government-style 4-column footer with links |
| `style/about.css` | About section styles (not linked on any page) |
| `backend/config/db.js` | Empty — intended for database connection |
| `backend/src/routes/server.js` | Empty — intended for Express server |
| `.gitignore` | Standard Node.js ignore rules |
| `README.md` | Empty placeholder |
