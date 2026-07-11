const express = require("express");
const { submitMessage, getMessages } = require("../controllers/contactController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.post("/submit", submitMessage);
router.get("/", auth, admin, getMessages);

module.exports = router;
