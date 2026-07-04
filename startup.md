# 🚀 Sahayog24x7 — Project Startup Guide

## Overview

Sahayog24x7 is a **Smart Electricity Grievance System** with:
- **Frontend**: HTML, CSS, JavaScript (served statically by Express)
- **Backend**: Node.js + Express + MongoDB
- **Port**: `5000` (one server serves both frontend and API)

---

## 📋 Prerequisites

| Tool | Version | Check Command |
|------|---------|--------------|
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| MongoDB | v6+ | `mongod --version` or use MongoDB Atlas |

---

## 🛠 Setup Steps

### 1. Clone the project

```bash
cd sahayog24x7
```

### 2. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Configure environment variables

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sahayog24x7
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

- **Local MongoDB**: Make sure `mongod` is running
- **MongoDB Atlas**: Replace `MONGODB_URI` with your Atlas connection string

### 4. Seed a test worker (required for login)

Start the server first (see below), then in another terminal:

```bash
curl -X POST http://localhost:5000/api/auth/seed \
  -H "Content-Type: application/json" \
  -d '{"employeeId": "WB001", "name": "Rahul Das", "password": "password123"}'
```

---

## ▶️ Start the Project (Single Command)

### Option A: Start everything from root

```bash
npm start
```

This starts both:
- **Backend API** on `http://localhost:5000/api/`
- **Frontend** on `http://localhost:5000/`

### Option B: Start just the backend

```bash
cd backend
npm start        # production mode
# OR
npm run dev      # development mode (auto-restart with nodemon)
```

---

## 📂 Project Structure

```
sahayog24x7/
├── index.html              # Landing page (served at /)
├── dashboard.html          # User dashboard
├── register.html           # Registration
├── adminDashboard.html     # Admin panel
├── userDashboard.html      # Worker dashboard
├── assets/                 # Images, icons
├── style/                  # CSS files
├── js/                     # Frontend JavaScript
├── backend/
│   ├── package.json
│   ├── .env
│   ├── server.js           # Entry point
│   └── src/
│       ├── app.js          # Express app
│       ├── config/db.js    # MongoDB connection
│       ├── models/         # Mongoose schemas
│       ├── controllers/    # Route handlers
│       ├── routes/         # Express routes
│       ├── middleware/      # Auth, upload
│       └── uploads/        # Photo uploads
└── project_documentation/  # Specs & docs
```

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/login` | No | Worker login |
| GET | `/api/complaints` | JWT | List assigned complaints |
| GET | `/api/complaints/:id` | JWT | Get complaint details |
| PUT | `/api/complaints/:id/start` | JWT | Start work |
| POST | `/api/work-report` | JWT+File | Submit work report |

---

## 🐞 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` on MongoDB | Start MongoDB: `mongod --dbpath /data/db` |
| `MODULE_NOT_FOUND` | Run `npm install` in `backend/` |
| Port 5000 in use | Change `PORT` in `.env` |
| CORS errors | Backend has CORS enabled by default |
| File upload fails | Ensure `uploads/` directory exists |
