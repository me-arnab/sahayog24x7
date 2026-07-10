const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const noticeController = require("../controllers/noticeController");

// Public / Consumer routes
router.get("/consumer", noticeController.getConsumerNotices);

// Protected routes (Admin only)
router.use(auth);
router.use(admin);

router.get("/stats", noticeController.getStats);
router.get("/", noticeController.getNotices);
router.get("/:id", noticeController.getNotice);
router.post("/", noticeController.createNotice);
router.put("/:id", noticeController.updateNotice);
router.delete("/:id", noticeController.deleteNotice);
router.patch("/:id/status", noticeController.toggleStatus);

module.exports = router;
