import express from "express";
import { createStream } from "../controllers/context-engineering.js";
const router = express.Router();

router.get("/create-stream", createStream);

export default router;
