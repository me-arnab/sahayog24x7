const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Worker = require("../models/Worker");

const fallbackWorkers = new Map();
const fallbackUsers = new Map();

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
        { id: user._id, email: user.email, role: user.role },
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
      { id: user._id, email: user.email, role: user.role },
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
        { id: user._id, email: user.email, role: user.role },
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
