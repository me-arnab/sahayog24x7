const admin = (req, res, next) => {
  if (req.authType !== "user" || !req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = admin;
