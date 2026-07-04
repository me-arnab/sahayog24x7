# 🧪 Sahayog24x7 — API Test Cases

> **Status**: ✅ All tests passing (last run: 5 Jul 2026)

---

## Prerequisites

1. MongoDB is running locally on `localhost:27017`
2. Backend server is started: `cd backend && npm start`
3. Base URL: `http://localhost:5000`

---

## 📋 Test 1: Health Check

```bash
curl -s http://localhost:5000/api/health | jq .
```

**Expected:**
```json
{
  "status": "OK",
  "timestamp": "2026-07-05T..."
}
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 2: Seed Test Worker

```bash
curl -s -X POST http://localhost:5000/api/auth/seed \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"WB001","name":"Rahul Das","password":"password123"}' | jq .
```

**Expected (201):**
```json
{
  "message": "Worker created",
  "worker": { "id": "...", "employeeId": "WB001", "name": "Rahul Das", "role": "FIELD_WORKER" }
}
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 3: Seed Duplicate Worker (Conflict)

```bash
curl -s -X POST http://localhost:5000/api/auth/seed \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"WB001","name":"Rahul Das","password":"password123"}' | jq .
```

**Expected (409):**
```json
{ "message": "Worker already exists" }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 4: Login — Valid Credentials

```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"WB001","password":"password123"}' | jq .
```

**Expected (200):**
```json
{
  "token": "<JWT_TOKEN>",
  "worker": { "id": "...", "employeeId": "WB001", "name": "Rahul Das", "role": "FIELD_WORKER" }
}
```

> Save the `token` value — it's needed for authenticated tests below.

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 5: Login — Invalid Credentials

```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"WB001","password":"wrongpassword"}' | jq .
```

**Expected (401):**
```json
{ "message": "Invalid credentials" }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 6: Login — Missing Fields

```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

**Expected (400):**
```json
{ "message": "Employee ID and password are required" }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 7: Get Complaints — Without Token (Unauthorized)

```bash
curl -s http://localhost:5000/api/complaints | jq .
```

**Expected (401):**
```json
{ "message": "No token provided" }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 8: Get Complaints — With Token (Empty List)

```bash
TOKEN="<token_from_test_4>"
curl -s http://localhost:5000/api/complaints \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected (200):**
```json
[]
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 9: Get Complaint by ID — Not Found

```bash
TOKEN="<token_from_test_4>"
curl -s http://localhost:5000/api/complaints/000000000000000000000000 \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected (404):**
```json
{ "message": "Complaint not found" }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 10: Start Work — Complaint Not Found

```bash
TOKEN="<token_from_test_4>"
curl -s -X PUT http://localhost:5000/api/complaints/000000000000000000000000/start \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected (404):**
```json
{ "message": "Complaint not found" }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 11: Submit Work Report — Without Token

```bash
curl -s -X POST http://localhost:5000/api/work-report \
  -F "complaintId=000000000000000000000000" \
  -F "workPerformed=Test" \
  -F "conditionAfter=OK" \
  -F "afterPhoto=@somefile.jpg" | jq .
```

**Expected (401):**
```json
{ "message": "No token provided" }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 12: Submit Work Report — Missing Fields

```bash
TOKEN="<token_from_test_4>"
curl -s -X POST http://localhost:5000/api/work-report \
  -H "Authorization: Bearer $TOKEN" \
  -F "complaintId=000000000000000000000000" | jq .
```

**Expected (400):**
```json
{ "message": "complaintId, workPerformed, and conditionAfter are required" }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 13: Full Workflow (Create Complaint → Start → Submit Report)

> **Prerequisites**: Use `mongosh` to create a seeded complaint:

```javascript
// In mongosh:
use sahayog24x7
db.complaints.insertOne({
  complaintId: "CMP0001",
  consumerName: "Amit Kumar",
  address: "Barrackpore",
  description: "Transformer sparking",
  priority: "HIGH",
  status: "ASSIGNED",
  assignedWorker: ObjectId("<worker_id_from_test_2>"),
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 13a. Get the complaint

```bash
curl -s http://localhost:5000/api/complaints \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected:** Array with 1 complaint in `ASSIGNED` status.

| Result | ✅ PASS |
|--------|---------|

### 13b. Start work

```bash
COMPLAINT_ID="<id_from_13a>"
curl -s -X PUT "http://localhost:5000/api/complaints/$COMPLAINT_ID/start" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected:** Status changed to `IN_PROGRESS`, `startTime` is set.

| Result | ✅ PASS |
|--------|---------|

### 13c. Submit work report

```bash
# Create a dummy image for upload
echo "fake-image-data" > /tmp/after_photo.jpg

curl -s -X POST http://localhost:5000/api/work-report \
  -H "Authorization: Bearer $TOKEN" \
  -F "complaintId=$COMPLAINT_ID" \
  -F "workPerformed=Fuse replaced and transformer reset" \
  -F "conditionAfter=Supply restored successfully" \
  -F "afterPhoto=@/tmp/after_photo.jpg" | jq .
```

**Expected (201):**
```json
{
  "workReport": { "complaintId": "...", "workerId": "...", "afterPhoto": "/uploads/after_...jpg", ... },
  "complaint": { "status": "COMPLETED", "startTime": "...", "endTime": "...", "timeTakenInSeconds": <number>, ... }
}
```

| Result | ✅ PASS |
|--------|---------|

### 13d. Verify complaint is COMPLETED

```bash
curl -s "http://localhost:5000/api/complaints/$COMPLAINT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .status
```

**Expected:** `"COMPLETED"`

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 14: Attempt Start Work on Already Completed Complaint

```bash
curl -s -X PUT "http://localhost:5000/api/complaints/$COMPLAINT_ID/start" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected (400):**
```json
{ "message": "Cannot start work. Current status: COMPLETED" }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 15: Attempt Submit Report on Already Completed Complaint

```bash
curl -s -X POST http://localhost:5000/api/work-report \
  -H "Authorization: Bearer $TOKEN" \
  -F "complaintId=$COMPLAINT_ID" \
  -F "workPerformed=Test" \
  -F "conditionAfter=OK" \
  -F "afterPhoto=@/tmp/after_photo.jpg" | jq .
```

**Expected (400):**
```json
{ "message": "Cannot submit report. Current status: COMPLETED. Must be IN_PROGRESS." }
```

| Result | ✅ PASS |
|--------|---------|

---

## 📋 Test 16: Unauthorized Worker Access (Different Worker)

Seed another worker:

```bash
curl -s -X POST http://localhost:5000/api/auth/seed \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"WB002","name":"Suresh","password":"pass456"}' | jq .
```

```bash
TOKEN2=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"WB002","password":"pass456"}' | jq -r '.token')

curl -s "http://localhost:5000/api/complaints/$COMPLAINT_ID" \
  -H "Authorization: Bearer $TOKEN2" | jq .
```

**Expected (403):**
```json
{ "message": "This complaint is not assigned to you" }
```

| Result | ✅ PASS |
|--------|---------|

---

## Summary

| # | Test Case | Expected Status | Result |
|---|-----------|-----------------|--------|
| 1 | Health check | 200 OK | ✅ |
| 2 | Seed worker | 201 Created | ✅ |
| 3 | Seed duplicate | 409 Conflict | ✅ |
| 4 | Login valid | 200 + JWT | ✅ |
| 5 | Login invalid password | 401 | ✅ |
| 6 | Login missing fields | 400 | ✅ |
| 7 | Get complaints no auth | 401 | ✅ |
| 8 | Get complaints with auth | 200 | ✅ |
| 9 | Get complaint not found | 404 | ✅ |
| 10 | Start work not found | 404 | ✅ |
| 11 | Submit report no auth | 401 | ✅ |
| 12 | Submit report missing fields | 400 | ✅ |
| 13a | Get assigned complaint | 200 | ✅ |
| 13b | Start work | 200 → IN_PROGRESS | ✅ |
| 13c | Submit report | 201 → COMPLETED | ✅ |
| 13d | Verify completed | 200 | ✅ |
| 14 | Start on completed | 400 | ✅ |
| 15 | Report on completed | 400 | ✅ |
| 16 | Unauthorized worker | 403 | ✅ |

---

## Running Automated Test Suite

An automated test script is available at `backend/tests/api.test.js`. Run it with:

```bash
cd backend
npm test
```

This requires MongoDB to be running and will:
1. Connect to the test database
2. Run all the above test cases
3. Clean up test data after completion
