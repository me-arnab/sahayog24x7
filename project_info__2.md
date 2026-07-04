# Sahayog24x7 — Codebase Overview & Dynamic Migration Roadmap

The full report has been saved to **`project_info__1.md`** in the project root. Below is a summary of the most critical findings and the path forward.

---

## What I Found

**Sahayog24x7 is a static frontend-only prototype** — a complaint management platform concept for electricity issues, built entirely with plain HTML/CSS/JavaScript. All data lives in memory. The `backend/` directory contains two empty files. There is no database, no authentication, no API, no file upload, and no persistence of any kind.

### The Problem in One Sentence
The application looks functional but loses all data on page reload. Three identical 400-line JavaScript files manage mock data that disappears when the tab closes.

### Key Surprises for a Developer
1. **Login and registration don't work** — the login overlay on `index.html` submits nowhere; the register page does client-side validation and shows an `alert()`
2. **Three identical dashboard JS files** — `js/dashboard.js`, `js/userDashboard.js`, and `js/adminDashboard.js` are ~97% the same code, making maintenance a nightmare
3. **File upload is declared but never read** — the `<input type="file">` exists but JavaScript never accesses the `FileList`
4. **Contact form does nothing** — no `action` URL on the form element
5. **No package.json** — zero dependency management
6. **Backend directory is a shell** — both `db.js` and `server.js` are completely empty

---

## The Migration Plan (6 Phases)

The report includes a **complete, step-by-step plan** to turn this into a dynamic, production-ready application:

### Phase 0: Project Setup
Initialize npm, install Express/Mongoose/JWT/Socket.IO, create `.env`

### Phase 1: Database Schema
Three MongoDB collections: **users** (with bcrypt passwords + roles), **complaints** (with user foreign key, status lifecycle, team assignment), **notifications**

### Phase 2: Backend API Endpoints
Full REST API with:
- Auth routes (register, login, profile)
- Complaint CRUD (create, list, detail, update, stats, rate)
- File uploads (multer)
- Notifications (optional)

### Phase 3: Authentication & Authorization
JWT-based auth with bcrypt password hashing, `authMiddleware` and `adminMiddleware` for role-based access

### Phase 4: Frontend Refactoring
- Delete duplicate JS files, keep only `dashboard.js`
- Create `api.js` (axios instance with auth interceptor) and `auth.js` (token management)
- Replace all mock data with real API calls
- Conditionally render user vs admin views based on JWT role

### Phase 5: Real-Time with Socket.IO
Admin gets live notifications of new complaints; users get live status updates

### Phase 6: Advanced Features (Post-MVP)
Email/SMS notifications, CSV export, dashboard charts, pagination, cloud image storage, rate limiting

---

## Files That Need Action

**Backend (all new or replaced):**
- `backend/package.json`, `backend/.env`, `backend/src/server.js`
- `backend/src/config/db.js` (filled in)
- 3 Mongoose models (User, Complaint, Notification)
- 3 route files (auth, complaints, uploads)
- 2 middleware files (auth, admin)
- 1 utility file (ID generator)

**Frontend (modified or deleted):**
- `js/dashboard.js` → rewrite to use API calls
- `js/userDashboard.js` → **delete**
- `js/adminDashboard.js` → **delete**
- `js/api.js` → **new**
- `js/auth.js` → **new**
- `index.html` → modify login form
- `register.html` → rewrite to use API
- `dashboard.html` → add auth guard + conditional rendering
- `userDashboard.html` → **delete**
- `adminDashboard.html` → **delete**
- `js/loginFloat.js` → expand for real submit

**12 static files stay unchanged** (all assets, most CSS files, `ourServices.js`, `.gitignore`)

---

## Suggested Reading Order for a Developer

1. Read this report (`project_info__1.md`)
2. Read `js/dashboard.js` (to understand the mock data flow)
3. Read `dashboard.html` (the full dashboard layout)
4. Read `backend/config/db.js` + `backend/src/routes/server.js` (to confirm they're empty)
5. Read `js/loginFloat.js` and `register.html` (to understand the auth gap)
6. Start building from Phase 0 in the migration plan

---

The `project_info__1.md` file contains the complete detailed breakdown including every API endpoint, every data model field, every file that needs modification, and the non-obvious design decisions. Use it as your blueprint.