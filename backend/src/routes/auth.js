const express = require("express");
const router = express.Router();
const { login, loginCitizen, register, seedWorker } = require("../controllers/authController");

router.post("/register", register);
router.post("/login-citizen", loginCitizen);
router.post("/login", login);
router.post("/seed", seedWorker);

module.exports = router;
