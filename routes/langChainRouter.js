import express from "express";
import {
  createEmbeddingsAndStoreInSupabase,
  generateConversationalResponse,
} from "../controllers/lc-text-splitter.js";
const router = express.Router();

router.get("/split-text", createEmbeddingsAndStoreInSupabase);
router.get("/lc-chat-response?:query", generateConversationalResponse);

export default router;
