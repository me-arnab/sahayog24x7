# 🚀 Sahayog24x7 — Project Startup Guide

## Overview

Sahayog24x7 is a **Smart Electricity Grievance System** with:

- **Frontend**: React + TypeScript + Tailwind CSS v4 (Vite dev server on port 5173)
- **Backend**: Node.js + Express + MongoDB (port 5000)
- **Legacy Frontend**: Original HTML/CSS/JS files still in `frontend/` (served statically by Express)

---

## 📋 Prerequisites

| Tool    | Version | Check Command          |
| ------- | ------- | ---------------------- |
| Node.js | v18+    | `node --version`       |
| npm     | v9+     | `npm --version`        |
| MongoDB | v6+     | `mongod --version` or use MongoDB Atlas |

---

## 🛠 Setup Steps

### 1. Clone and enter the project

```bash
cd sahayog24x7
```

### 2. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### 4. Configure environment variables

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sahayog24x7
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

- **Local MongoDB**: Make sure `mongod` is running
- **MongoDB Atlas**: Replace `MONGODB_URI` with your Atlas connection string

---

## ▶️ Start the Project

You need to run **two terminals** — one for the backend, one for the frontend.

### Terminal 1: Backend (port 5000)

**Option A: Production mode**

```bash
cd backend
npm start
```

**Option B: Development mode (auto-restart with nodemon)**

```bash
cd backend
npm run dev
```

The backend serves:

- API at `http://localhost:5000/api/`
- Legacy frontend files at `http://localhost:5000/`
- **Important**: The default `app.js` serves the old `index.html` as root. The new React frontend runs separately on port 5173.

### Terminal 2: React Frontend (port 5173)

```bash
cd client
npm run dev
```

Then open **http://localhost:5173/** in your browser.

The Vite dev server is configured to proxy `/api` requests to the backend (port 5000), so all API calls work seamlessly without CORS issues.

---

## 🌐 Available Pages

| Page                     | URL (port 5173)           | Description                             |
| ------------------------ | ------------------------- | --------------------------------------- |
| Home                     | `/`                       | Landing page with hero, services, etc.  |
| Register                 | `/register`               | Citizen registration form               |
| Login                    | `/login`                  | Worker login (employeeId + password)    |
| User Dashboard           | `/user/dashboard`         | Submit & track complaints (mock data)   |
| Admin Dashboard          | `/admin/dashboard`        | Filter, search, manage complaints       |
| Worker Dashboard         | `/worker/dashboard`       | Assigned complaints, start work, report |

---

## 🔐 Seeding Test Data (Worker Login)

### Seed a test worker

Start the backend server first, then:

**Windows PowerShell:**

```powershell
$body = @{
  employeeId = "WB001"
  name       = "Rahul Das"
  password   = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/auth/seed -Method Post -ContentType "application/json" -Body $body
```

**Linux / macOS / WSL:**

```bash
curl -X POST http://localhost:5000/api/auth/seed \
  -H "Content-Type: application/json" \
  -d '{"employeeId": "WB001", "name": "Rahul Das", "password": "password123"}'
```

### Seed test complaints for the worker

After seeding the worker, assign sample complaints:

**Windows PowerShell:**

```powershell
$json = @'
{
  "employeeId": "WB001",
  "complaints": [
    {
      "complaintId": "CMP-2024-001",
      "consumerName": "Ananya Roy",
      "address": "12/3 Ballygunge Place, Kolkata",
      "description": "No power supply for over 6 hours. Entire block affected.",
      "priority": "CRITICAL"
    },
    {
      "complaintId": "CMP-2024-002",
      "consumerName": "Suman Ghosh",
      "address": "45 Lake View Road, Flat 3B, Kolkata",
      "description": "Frequent voltage fluctuations damaging appliances.",
      "priority": "HIGH"
    },
    {
      "complaintId": "CMP-2024-003",
      "consumerName": "Priya Banerjee",
      "address": "7B Rashbehari Avenue, Kolkata",
      "description": "Street light pole sparking near the entrance gate.",
      "priority": "HIGH"
    },
    {
      "complaintId": "CMP-2024-004",
      "consumerName": "Arun Das",
      "address": "89 Naktala Road, Kolkata",
      "description": "Single phase power supply issue – only one phase working.",
      "priority": "MEDIUM"
    },
    {
      "complaintId": "CMP-2024-005",
      "consumerName": "Meera Iyer",
      "address": "22 Southern Avenue, Kolkata",
      "description": "No electricity in the entire building since yesterday evening.",
      "priority": "CRITICAL"
    }
  ]
}
'@

Invoke-RestMethod -Uri http://localhost:5000/api/complaints/seed -Method Post -ContentType "application/json" -Body $json
```

**Linux / macOS / WSL:**

```bash
curl -X POST http://localhost:5000/api/complaints/seed \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "WB001",
    "complaints": [
      {"complaintId": "CMP-2024-001", "consumerName": "Ananya Roy", "address": "12/3 Ballygunge Place, Kolkata", "description": "No power supply for over 6 hours.", "priority": "CRITICAL"},
      {"complaintId": "CMP-2024-002", "consumerName": "Suman Ghosh", "address": "45 Lake View Road, Flat 3B, Kolkata", "description": "Frequent voltage fluctuations.", "priority": "HIGH"},
      {"complaintId": "CMP-2024-003", "consumerName": "Priya Banerjee", "address": "7B Rashbehari Avenue, Kolkata", "description": "Street light pole sparking.", "priority": "HIGH"},
      {"complaintId": "CMP-2024-004", "consumerName": "Arun Das", "address": "89 Naktala Road, Kolkata", "description": "Single phase power supply issue.", "priority": "MEDIUM"},
      {"complaintId": "CMP-2024-005", "consumerName": "Meera Iyer", "address": "22 Southern Avenue, Kolkata", "description": "No electricity entire building.", "priority": "CRITICAL"}
    ]
  }'
```

### Login to the Worker Dashboard

1. Open http://localhost:5173/login
2. Enter: Employee ID = `WB001`, Password = `password123`
3. You'll be redirected to the Worker Dashboard showing the assigned complaints

---

## 🧱 Project Structure

```
sahayog24x7/
├── client/                    # NEW: React + TypeScript frontend
│   ├── src/
│   │   ├── types/index.ts     # TypeScript interfaces
│   │   ├── api/               # Axios API client + endpoint modules
│   │   ├── context/           # AuthContext (JWT login/logout)
│   │   ├── components/        # Navbar, Footer
│   │   ├── pages/             # Home, Login, Register, 3 dashboards
│   │   ├── App.tsx            # Router with 6 routes
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Tailwind v4 + custom theme
│   ├── vite.config.ts         # Vite config with API proxy
│   └── index.html             # SPA shell
│
├── frontend/                  # Legacy HTML/CSS/JS (still served by backend)
│   ├── html/
│   ├── js/
│   └── style/
│
├── backend/                   # Express + MongoDB API
│   ├── server.js              # Entry point
│   ├── .env                   # Environment config
│   └── src/
│       ├── app.js             # Express app setup
│       ├── config/db.js       # MongoDB connection
│       ├── models/            # Mongoose schemas
│       ├── controllers/       # Route handlers
│       ├── routes/            # Express routes
│       ├── middleware/         # Auth, upload
│       └── uploads/           # Photo uploads
│
└── documentation/             # Docs & guides
```

---

## 🌐 API Endpoints

| Method | Endpoint                    | Auth     | Description              |
| ------ | --------------------------- | -------- | ------------------------ |
| GET    | `/api/health`               | No       | Health check             |
| POST   | `/api/auth/login`           | No       | Worker login             |
| POST   | `/api/auth/seed`            | No       | Create test worker       |
| GET    | `/api/complaints`           | JWT      | List assigned complaints |
| GET    | `/api/complaints/:id`       | JWT      | Get complaint details    |
| PUT    | `/api/complaints/:id/start` | JWT      | Start work               |
| POST   | `/api/work-report/submit`   | JWT+File | Submit work report       |

---

## 🔧 Troubleshooting

| Problem                        | Solution                                        |
| ------------------------------ | ----------------------------------------------- |
| `ECONNREFUSED` on MongoDB      | Start MongoDB: `mongod --dbpath /data/db`       |
| `MODULE_NOT_FOUND`             | Run `npm install` in `backend/` or `client/`    |
| Port 5000 in use               | Change `PORT` in `backend/.env`                 |
| Port 5173 in use               | Vite will auto-prompt for the next available    |
| Network error on API calls     | Ensure backend is running on port 5000           |
| Blank page on React frontend   | Check browser console for errors                |
| CORS errors                    | Vite proxy forwards `/api` — no CORS needed     |
| File upload fails              | Ensure `backend/src/uploads/` directory exists  |
