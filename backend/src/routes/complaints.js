const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAssignedComplaints,
  getComplaintById,
  startWork,
} = require("../controllers/complaintController");

router.get("/", auth, getAssignedComplaints);
router.get("/:id", auth, getComplaintById);
router.put("/:id/start", auth, startWork);

module.exports = router;
