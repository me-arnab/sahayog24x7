const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Worker = require("../models/Worker");
const nodemailer = require("nodemailer");

const fallbackWorkers = new Map();
const fallbackUsers = new Map();

// Inject a default admin for testing when DB is unavailable
bcrypt.hash("Admin123!", 10).then((hashed) => {
  fallbackUsers.set("admin@sahayog24x7.com", {
    _id: "admin-fallback-id",
    name: "System Admin",
    email: "admin@sahayog24x7.com",
    phone: "9999999999",
    consumerId: "ADMIN-001",
    password: hashed,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

// Fallback secret so login works without a .env file
const JWT_SECRET = process.env.JWT_SECRET || "sahayog24x7_jwt_fallback_secret_2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const isMongoReady = () => mongoose.connection.readyState === 1;

const fallbackFindWorker = async (employeeId) => fallbackWorkers.get(employeeId) || null;

const fallbackCreateWorker = async ({ employeeId, name, password }) => {
  const worker = {
    _id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    employeeId,
    name,
    password,
    role: "FIELD_WORKER",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  fallbackWorkers.set(employeeId, worker);
  return worker;
};

const fallbackFindUser = async (identifier) => {
  if (fallbackUsers.has(identifier.email)) {
    return fallbackUsers.get(identifier.email);
  }

  if (fallbackUsers.has(identifier.consumerId)) {
    return fallbackUsers.get(identifier.consumerId);
  }

  return null;
};

const fallbackCreateUser = async ({ name, email, phone, consumerId, password }) => {
  const user = {
    _id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    phone,
    consumerId,
    password,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  fallbackUsers.set(email, user);
  fallbackUsers.set(consumerId, user);
  return user;
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, consumerId, password } = req.body;

    if (!name || !email || !phone || !consumerId || !password) {
      return res.status(400).json({
        message: "name, email, phone, consumerId, and password are required",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();
    const trimmedPhone = String(phone).trim();
    const trimmedConsumerId = String(consumerId).trim();

    if (!isMongoReady()) {
      console.warn("MongoDB unavailable; using in-memory citizen store for auth");
      const existing = await fallbackFindUser({
        email: normalizedEmail,
        consumerId: trimmedConsumerId,
      });

      if (existing) {
        return res.status(409).json({
          message: "User already exists with this email or consumerId",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await fallbackCreateUser({
        name: trimmedName,
        email: normalizedEmail,
        phone: trimmedPhone,
        consumerId: trimmedConsumerId,
        password: hashedPassword,
      });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, accountType: "user" },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          consumerId: user.consumerId,
          role: user.role,
        },
      });
    }

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { consumerId: trimmedConsumerId }],
    });

    if (existing) {
      return res.status(409).json({
        message: "User already exists with this email or consumerId",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      phone: trimmedPhone,
      consumerId: trimmedConsumerId,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, accountType: "user" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        consumerId: user.consumerId,
        role: user.role,
      },
    });
  } catch (error) {
    if (!isMongoReady() || /ECONNREFUSED|ENOTFOUND|querySrv|timed out/i.test(error.message)) {
      console.warn("MongoDB unavailable; using in-memory citizen store for auth");
      const existing = await fallbackFindUser({
        email: String(req.body.email || "").trim().toLowerCase(),
        consumerId: String(req.body.consumerId || "").trim(),
      });

      if (existing) {
        return res.status(409).json({
          message: "User already exists with this email or consumerId",
        });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await fallbackCreateUser({
        name: String(req.body.name || "").trim(),
        email: String(req.body.email || "").trim().toLowerCase(),
        phone: String(req.body.phone || "").trim(),
        consumerId: String(req.body.consumerId || "").trim(),
        password: hashedPassword,
      });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, accountType: "user" },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          consumerId: user.consumerId,
          role: user.role,
        },
      });
    }

    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.seedWorker = async (req, res) => {
  try {
    const { employeeId, name, password } = req.body;

    if (!employeeId || !name || !password) {
      return res.status(400).json({ message: "employeeId, name, and password are required" });
    }

    if (!isMongoReady()) {
      console.warn("MongoDB unavailable; using in-memory worker store for auth");
      const existing = await fallbackFindWorker(employeeId);
      if (existing) {
        return res.status(409).json({ message: "Worker already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const worker = await fallbackCreateWorker({
        employeeId,
        name,
        password: hashedPassword,
      });

      return res.status(201).json({
        message: "Worker created",
        worker: { id: worker._id, employeeId: worker.employeeId, name: worker.name, role: worker.role },
      });
    }

    const existing = await Worker.findOne({ employeeId });
    if (existing) {
      return res.status(409).json({ message: "Worker already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const worker = await Worker.create({
      employeeId,
      name,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Worker created",
      worker: { id: worker._id, employeeId: worker.employeeId, name: worker.name, role: worker.role },
    });
  } catch (error) {
    if (!isMongoReady() || /ECONNREFUSED|ENOTFOUND|querySrv|timed out/i.test(error.message)) {
      console.warn("MongoDB unavailable; using in-memory worker store for auth");
      const existing = await fallbackFindWorker(req.body.employeeId);
      if (existing) {
        return res.status(409).json({ message: "Worker already exists" });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const worker = await fallbackCreateWorker({
        employeeId: req.body.employeeId,
        name: req.body.name,
        password: hashedPassword,
      });

      return res.status(201).json({
        message: "Worker created",
        worker: { id: worker._id, employeeId: worker.employeeId, name: worker.name, role: worker.role },
      });
    }

    console.error("Seed error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.seedAdmin = async (req, res) => {
  try {
    const { name, email, phone, consumerId, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    if (!isMongoReady()) {
      console.warn("MongoDB unavailable; using in-memory admin store for auth");
      const existing = await fallbackFindUser({ email });
      if (existing) {
        return res.status(409).json({ message: "Admin already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await fallbackCreateUser({
        name,
        email,
        phone: phone || "0000000000",
        consumerId: consumerId || `ADMIN-${Date.now()}`,
        password: hashedPassword,
      });
      admin.role = "admin";

      return res.status(201).json({
        message: "Admin created",
        admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User/Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      email,
      phone: phone || "0000000000",
      consumerId: consumerId || `ADMIN-${Date.now()}`,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created",
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error("Seed Admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWorkers = async (req, res) => {
  try {
    if (!isMongoReady()) {
      const workers = Array.from(fallbackWorkers.values()).map(w => ({
        id: w._id,
        employeeId: w.employeeId,
        name: w.name,
        role: w.role,
        createdAt: w.createdAt
      }));
      return res.json(workers);
    }

    const workers = await Worker.find().select("-password").sort({ createdAt: -1 });
    res.json(workers.map(w => ({
      id: w._id,
      employeeId: w.employeeId,
      name: w.name,
      role: w.role,
      createdAt: w.createdAt
    })));
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    if (!isMongoReady()) {
      const admins = Array.from(fallbackUsers.values()).filter(u => u.role === 'admin').map(w => ({
        id: w._id,
        email: w.email,
        name: w.name,
        role: w.role,
        createdAt: w.createdAt
      }));
      return res.json(admins);
    }

    const admins = await User.find({ role: "admin" }).select("-password").sort({ createdAt: -1 });
    res.json(admins.map(w => ({
      id: w._id,
      email: w.email,
      name: w.name,
      role: w.role,
      createdAt: w.createdAt
    })));
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginCitizen = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const loginIdentifier = String(identifier || req.body.email || req.body.consumerId || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: "Email/Consumer ID and password are required" });
    }

    if (!isMongoReady()) {
      console.warn("MongoDB unavailable; using in-memory citizen store for auth");
      const user = await fallbackFindUser({
        email: loginIdentifier.toLowerCase(),
        consumerId: loginIdentifier,
      });

      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      if (user.role !== "user") return res.status(403).json({ message: "Staff accounts must sign in through the staff portal" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role, accountType: "user" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, consumerId: user.consumerId, role: user.role } });
    }

    const user = await User.findOne({
      $or: [{ email: loginIdentifier.toLowerCase() }, { consumerId: loginIdentifier }],
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (user.role !== "user") return res.status(403).json({ message: "Staff accounts must sign in through the staff portal" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, accountType: "user" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, consumerId: user.consumerId, role: user.role } });
  } catch (error) {
    console.error("Citizen login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { employeeId, identifier, password, accountType } = req.body;

    // Admin login using identifier (email)
    if (accountType === "admin" || (!employeeId && !!identifier)) {
      const loginIdentifier = String(identifier || req.body.email || "").trim();
      
      if (!loginIdentifier || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (!isMongoReady()) {
        const user = await fallbackFindUser({ email: loginIdentifier.toLowerCase(), consumerId: loginIdentifier });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        if (user.role !== "admin") return res.status(403).json({ message: "Citizens cannot log in through the staff portal" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role, accountType: "user" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, consumerId: user.consumerId, role: user.role } });
      }

      const user = await User.findOne({ email: loginIdentifier.toLowerCase() });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      if (user.role !== "admin") return res.status(403).json({ message: "Citizens cannot log in through the staff portal" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role, accountType: "user" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, consumerId: user.consumerId, role: user.role } });
    }

    // Worker login using employeeId
    if (!employeeId || !password) {
      return res.status(400).json({ message: "Employee ID and password are required" });
    }

    if (!isMongoReady()) {
      const worker = await fallbackFindWorker(employeeId);
      if (!worker) return res.status(401).json({ message: "Invalid credentials" });
      
      const isMatch = await bcrypt.compare(password, worker.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: worker._id, employeeId: worker.employeeId, role: worker.role, accountType: "worker" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.json({ token, worker: { id: worker._id, employeeId: worker.employeeId, name: worker.name, role: worker.role } });
    }

    const worker = await Worker.findOne({ employeeId });
    if (!worker) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, worker.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: worker._id, employeeId: worker.employeeId, role: worker.role, accountType: "worker" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, worker: { id: worker._id, employeeId: worker.employeeId, name: worker.name, role: worker.role } });
  } catch (error) {
    console.error("Staff login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user;

    if (!isMongoReady()) {
      user = await fallbackFindUser({ email: normalizedEmail });
    } else {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (!isMongoReady()) {
      user.otp = hashedOtp;
      user.otpExpires = otpExpires;
      fallbackUsers.set(normalizedEmail, user);
    } else {
      user.otp = hashedOtp;
      user.otpExpires = otpExpires;
      await user.save();
    }

    // Send email via Nodemailer
    try {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (emailUser && emailPass) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        const mailOptions = {
          from: `"Sahayog24x7 Support" <${emailUser}>`,
          to: user.email,
          subject: "Forgot Password OTP Verification",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #475569; font-size: 14px;">Hello ${user.name},</p>
              <p style="color: #475569; font-size: 14px;">We received a request to reset your password. Use the verification code below to proceed:</p>
              <div style="margin: 25px 0; text-align: center;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #3b82f6; background-color: #f1f5f9; padding: 10px 24px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">${otp}</span>
              </div>
              <p style="color: #ef4444; font-size: 13px; font-weight: 500;">This code will expire in 5 minutes. If you did not make this request, you can safely ignore this email.</p>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 25px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                This message was sent automatically from the Sahayog24x7 Auth System.
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${user.email}`);
      } else {
        console.warn("=== [Forgot Password OTP Fallback] ===");
        console.warn(`Email: ${user.email}`);
        console.warn(`Generated OTP: ${otp}`);
        console.warn("======================================");
      }
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError.message);
      // We print to console, but don't fail the request so it can fallback to console during dev
    }

    res.json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user;

    if (!isMongoReady()) {
      user = await fallbackFindUser({ email: normalizedEmail });
    } else {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP requested for this user" });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user;

    if (!isMongoReady()) {
      user = await fallbackFindUser({ email: normalizedEmail });
    } else {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP requested or validation session expired" });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: "OTP validation has expired" });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP credentials" });
    }

    // Hash new password and clear OTP
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!isMongoReady()) {
      user.password = hashedPassword;
      user.otp = null;
      user.otpExpires = null;
      fallbackUsers.set(normalizedEmail, user);
    } else {
      user.password = hashedPassword;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
    }

    res.json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
