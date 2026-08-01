import express from "express";
import {
  getEmbeddings,
  ingestDocumentsAndGenerateEmbeddings,
  retrieveSimilarDocuments,
} from "../../controllers/embeddings/embeddings.js";
const router = express.Router();

router.get("/get-embeddings", getEmbeddings);
router.post("/ingest-documents", ingestDocumentsAndGenerateEmbeddings);
router.get("/retrieve-similar-documents", retrieveSimilarDocuments);

export default router;
