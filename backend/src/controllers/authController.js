const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");

exports.seedWorker = async (req, res) => {
  try {
    const { employeeId, name, password } = req.body;

    if (!employeeId || !name || !password) {
      return res.status(400).json({ message: "employeeId, name, and password are required" });
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
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
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
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
