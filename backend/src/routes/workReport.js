const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { submitReport, getAllReports, approveReport, rejectReport } = require("../controllers/workReportController");
const admin = require("../middleware/admin");

router.post("/", auth, upload.single("afterPhoto"), submitReport);
router.post("/submit", auth, upload.single("afterPhoto"), submitReport);
router.get("/", auth, admin, getAllReports);
router.put("/:id/approve", auth, admin, approveReport);
router.put("/:id/reject", auth, admin, rejectReport);

module.exports = router;
