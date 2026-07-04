const express = require("express");
const router = express.Router();
const { login, seedWorker } = require("../controllers/authController");

router.post("/login", login);
router.post("/seed", seedWorker);

module.exports = router;
