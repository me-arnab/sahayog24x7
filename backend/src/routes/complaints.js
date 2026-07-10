const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const {
  createComplaint,
  getAssignedComplaints,
  getComplaintById,
  getMyComplaints,
  getComplaintCounts,
  getAdminComplaints,
  startWork,
  seedComplaints,
} = require("../controllers/complaintController");

router.post("/", auth, createComplaint);
router.get("/mine", auth, getMyComplaints);
router.get("/stats", auth, admin, getComplaintCounts);
router.get("/admin", auth, admin, getAdminComplaints);
router.get("/", auth, getAssignedComplaints);
router.get("/:id", auth, getComplaintById);
router.put("/:id/start", auth, startWork);
router.post("/seed", seedComplaints);

module.exports = router;
