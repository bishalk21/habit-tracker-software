import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import helmet from "helmet";
import pool, { initDatabase } from "./config/database-init.js";
import dreamsRouter from "./routes/dreams.js";
import {
  callHuggingFaceFunction,
  chatCompletions,
  classifyText,
  summarizeText,
} from "./routes/huggingFace.js";

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

app.get("/api/hfFunction", async (req, res) => {
  try {
    const text = await callHuggingFaceFunction();
    res.status(200).json({
      status: "success",
      message: "Hugging Face function executed successfully",
      data: text,
    });
  } catch (error) {
    console.error("Error calling Hugging Face function:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to call Hugging Face function",
    });
  }
});

app.post("/api/summarize", summarizeText);
app.post("/api/classifyText", classifyText);
app.post("/api/chat", chatCompletions);
// app.get("/api/chat", chatCompletions);

// SHUTDOWN HANDLER
app.get("/shutdown", async (req, res) => {
  try {
    console.log("=== Manual shutdown initiated ===");
    res.status(200).json({
      status: "success",
      message: "Server is shutting down...",
    });
    setTimeout(() => {
      process.kill(process.pid, "SIGTERM"); // Graceful shutdown
    }, 1000); // Delay to allow response to be sent
  } catch (error) {
    console.error("Shutdown failed:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to shutdown server",
    });
  }
});

// API Routes
app.use("/api/dreams", dreamsRouter);

// Initialize database then start server
let server;
initDatabase()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1); // Exit with failure
  });

process.on("SIGTERM", gracefulShutDown);
async function gracefulShutDown() {
  console.log("SIGTERM signal received, shutting down gracefully.");
  try {
    server.close(() => {
      console.log("HTTP server closed.");
    });
    await pool.end();
    console.log("Database connection pool closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during server shutdown:", error);
    process.exit(1);
  }
}
