
# Phase-1-Worker-Workflow.md (MongoDB Edition)

# Smart Electricity Grievance System
## Phase 1 – Field Worker Workflow

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript, Bootstrap, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT |
| File Upload | Multer |

---

# Workflow

```text
Worker Login
      │
      ▼
Assigned Complaints
      │
      ▼
Open Complaint
      │
      ▼
Click "Start Work"
      │
      ▼
Status → IN_PROGRESS
Start Time Recorded Automatically
      │
      ▼
Repair the Issue
      │
      ▼
Take After Photo
      │
      ▼
Fill Work Report
      │
      ▼
Submit Report
      │
      ▼
End Time Recorded Automatically
Time Taken Calculated Automatically
      │
      ▼
Complaint Completed
```

## MongoDB Collections

### workers

```json
{
  "_id": "ObjectId",
  "employeeId": "WB001",
  "name": "Rahul Das",
  "password": "<hashed>",
  "role": "FIELD_WORKER",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### complaints

```json
{
  "_id": "ObjectId",
  "complaintId": "CMP0001",
  "consumerName": "Amit Kumar",
  "address": "Barrackpore",
  "description": "Transformer sparking",
  "emergency": true,
  "status": "ASSIGNED",
  "assignedWorker": "ObjectId",
  "startTime": null,
  "endTime": null,
  "timeTakenInSeconds": null,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### workReports

```json
{
  "_id": "ObjectId",
  "complaintId": "ObjectId",
  "workerId": "ObjectId",
  "afterPhoto": "/uploads/report1.jpg",
  "workPerformed": "Fuse replaced",
  "conditionAfter": "Supply restored",
  "submittedAt": "Date"
}
```

---

# Backend Folder Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   │   ├── Worker.js
│   │   ├── Complaint.js
│   │   └── WorkReport.js
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   └── app.js
├── server.js
└── package.json
```

---

# Frontend Pages

```text
login.html
dashboard.html
complaints.html
complaint-details.html
work-report.html
```

---

# REST APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/login | Worker login |
| GET | /api/complaints | Assigned complaints |
| GET | /api/complaints/:id | Complaint details |
| PUT | /api/complaints/:id/start | Start work |
| POST | /api/work-report | Submit report |

---

# Backend Logic

## Start Work

```javascript
complaint.status = "IN_PROGRESS";
complaint.startTime = new Date();
await complaint.save();
```

## Submit Report

```javascript
complaint.status = "COMPLETED";
complaint.endTime = new Date();

const seconds =
Math.floor((complaint.endTime - complaint.startTime)/1000);

complaint.timeTakenInSeconds = seconds;

await complaint.save();
```

---

# Validation

- JWT required
- Complaint must belong to logged-in worker
- After photo required
- Work performed required
- Condition after repair required
- Complaint status must be IN_PROGRESS

---

# Acceptance Criteria

- Worker logs in
- Views assigned complaints
- Starts work
- Start time saved
- Uploads after photo
- Submits work report
- End time saved
- Time calculated automatically
- Complaint marked COMPLETED
