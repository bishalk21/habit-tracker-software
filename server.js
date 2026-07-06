import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import helmet from "helmet";
import pool, { initDatabase } from "./config/database-init.js";
import dreamsRouter from "./routes/dreams.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Add security headers
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

// health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1"); // Simple query to check database connectivity
    res.status(200).json({
      status: "success",
      db: "connected",
      uptime: process.uptime(),
      message: "Server is healthy & running!",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "error",
      db: "disconnected",
      uptime: process.uptime(),
      message: "Server is unhealthy. Database connection failed.",
    });
  }
});

// API Routes
app.use("/api/dreams", dreamsRouter);

// Initialize database then start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
  });
