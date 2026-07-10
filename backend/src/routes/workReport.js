const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { submitReport } = require("../controllers/workReportController");

router.post("/", auth, upload.single("afterPhoto"), submitReport);
router.post("/submit", auth, upload.single("afterPhoto"), submitReport);

module.exports = router;
