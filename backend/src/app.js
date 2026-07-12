const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");
const workReportRoutes = require("./routes/workReport");
const noticeRoutes = require("./routes/notices");
const contactRoutes = require("./routes/contact");

const fs = require("fs");

// Ensure uploads directory exists on startup
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration supporting localhost and Netlify domains
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Check if it's a Netlify subdomain
    const isNetlify = origin.endsWith(".netlify.app") || /^https?:\/\/.*\.netlify\.app(:\d+)?$/.test(origin);
    if (isNetlify) {
      return callback(null, true);
    }
    
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();

// Middleware
app.use(cors(corsOptions));
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
