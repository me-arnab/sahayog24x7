const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");

const JWT_SECRET = process.env.JWT_SECRET || "sahayog24x7_jwt_fallback_secret_2024";

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const worker = await Worker.findById(decoded.id);
    if (!worker) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.worker = worker;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = auth;
