const express = require("express");
const router = express.Router();
const { login, loginCitizen, register, seedWorker, forgotPassword, verifyOtp, resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login-citizen", loginCitizen);
router.post("/login", login);
router.post("/seed-worker", seedWorker);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Temporary route to seed admin from the browser
router.get("/seed-admin", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const User = require("../models/User");
    const email = "admin@sahayog24x7.com";
    const password = "AdminPassword123!";
    
    let admin = await User.findOne({ email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = await User.create({
        name: "Super Admin",
        email: email,
        phone: "9999999999",
        consumerId: "ADMIN-001",
        password: hashedPassword,
        role: "admin",
      });
    } else {
      admin.password = await bcrypt.hash(password, 10);
      await admin.save();
    }
    res.send(`<h1>Admin Seeded Successfully!</h1><p>Email: ${email}</p><p>Password: ${password}</p><p>You can now log in at the Staff Portal.</p>`);
  } catch (err) {
    res.status(500).send("Error seeding admin: " + err.message);
  }
});

module.exports = router;
