const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Worker = require("../models/Worker");

const fallbackWorkers = new Map();

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

exports.login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res
        .status(400)
        .json({ message: "Employee ID and password are required" });
    }

    if (!isMongoReady()) {
      console.warn("MongoDB unavailable; using in-memory worker store for auth");
      const worker = await fallbackFindWorker(employeeId);
      if (!worker) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, worker.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: worker._id, employeeId: worker.employeeId, role: worker.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        token,
        worker: {
          id: worker._id,
          employeeId: worker.employeeId,
          name: worker.name,
          role: worker.role,
        },
      });
    }

    const worker = await Worker.findOne({ employeeId });
    if (!worker) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, worker.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: worker._id, employeeId: worker.employeeId, role: worker.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      worker: {
        id: worker._id,
        employeeId: worker.employeeId,
        name: worker.name,
        role: worker.role,
      },
    });
  } catch (error) {
    if (!isMongoReady() || /ECONNREFUSED|ENOTFOUND|querySrv|timed out/i.test(error.message)) {
      console.warn("MongoDB unavailable; using in-memory worker store for auth");
      const worker = await fallbackFindWorker(req.body.employeeId);
      if (!worker) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(req.body.password, worker.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: worker._id, employeeId: worker.employeeId, role: worker.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        token,
        worker: {
          id: worker._id,
          employeeId: worker.employeeId,
          name: worker.name,
          role: worker.role,
        },
      });
    }

    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
