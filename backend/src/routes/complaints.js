const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAssignedComplaints,
  getComplaintById,
  startWork,
  seedComplaints,
} = require("../controllers/complaintController");

router.get("/", auth, getAssignedComplaints);
router.get("/:id", auth, getComplaintById);
router.put("/:id/start", auth, startWork);
router.post("/seed", seedComplaints);

module.exports = router;
