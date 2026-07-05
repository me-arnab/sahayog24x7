require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}/`);
    console.log(`Worker Dashboard: http://localhost:${PORT}/worker-dashboard.html`);
  });
};

connectDB()
  .then(() => {
    console.log("MongoDB connected — API is fully operational");
    startServer();
  })
  .catch((err) => {
    console.warn(`MongoDB unavailable: ${err.message}`);
    console.warn("Starting server with fallback mode so API routes remain available");
    startServer();
  });
