import express from "express";
import {
  generateChatResponse,
  pairTextWithEmbedding,
  podcastsTextEmbeddings,
  semanticSearch,
  textEmbeddings,
} from "../controllers/text-embeddings.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message:
      "embeddings route is working. Use the /text endpoint to get embeddings.",
  });
});

router.post("/text", textEmbeddings);
router.get("/text-pair", pairTextWithEmbedding);
router.get("/podcasts", podcastsTextEmbeddings);
router.get("/semantic-search", semanticSearch);
router.get("/chat-response", generateChatResponse);

export default router;
