const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");
const workReportRoutes = require("./routes/workReport");
const noticeRoutes = require("./routes/notices");
const contactRoutes = require("./routes/contact");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend static files (HTML, CSS, JS, assets)
// app.use(express.static(path.join(__dirname, "..", "..")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/work-report", workReportRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/contact", contactRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// SPA fallback — serve index.html for unknown routes (excl. /api)
// app.get("*", (req, res) => {
//   if (req.path.startsWith("/api")) {
//     return res.status(404).json({ message: "API route not found" });
//   }
//   res.sendFile(path.join(__dirname, "..", "..", "index.html"));
// });

// 404 for non-existing routes
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }

  res.status(404).json({ message: "Frontend is served by Vite." });
});

module.exports = app;
