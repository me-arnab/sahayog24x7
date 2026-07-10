const express = require("express");
const router = express.Router();
const { login, register, seedWorker } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/seed", seedWorker);

module.exports = router;
