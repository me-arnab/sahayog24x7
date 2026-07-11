const express = require("express");
const { submitMessage, getContactMessages, replyToContactMessage } = require("../controllers/contactController");

const router = express.Router();

router.post("/submit", submitMessage);
router.get("/", getContactMessages);
router.post("/:id/reply", replyToContactMessage);

module.exports = router;
