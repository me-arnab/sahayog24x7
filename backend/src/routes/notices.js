const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const noticeController = require("../controllers/noticeController");

// Public / Consumer routes
router.get("/consumer", noticeController.getConsumerNotices);

// Protected routes
router.use(authenticate);

router.get("/stats", noticeController.getStats);
router.get("/", noticeController.getNotices);
router.get("/:id", noticeController.getNotice);
router.post("/", noticeController.createNotice);
router.put("/:id", noticeController.updateNotice);
router.delete("/:id", noticeController.deleteNotice);
router.patch("/:id/status", noticeController.toggleStatus);

module.exports = router;
