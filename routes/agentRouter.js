import express from "express";
import { getWeatherAndActivitySuggestions } from "../controllers/agentFunctions.js";
import {
  autoFunctionCallingAgent,
  openAIFunctionAgent,
} from "../controllers/openAIfunctionAgent.js";
import {
  basicRetrieval,
  ingestDocuments,
} from "../controllers/agentic-retrieval-routing/ingestDocuments.js";
import { retrieveSimilarDocs } from "../controllers/agentic-retrieval-routing/retrieveSimilarDocs.js";
import { classifyAndRetrieveExercise } from "../controllers/agentic-retrieval-routing/agenticRetrieval.js";
const router = express.Router();

router.get("/weather-activity", getWeatherAndActivitySuggestions);
router.get("/openai-function-agent", autoFunctionCallingAgent);
router.get("/openai-function-agent", openAIFunctionAgent);

// agentic retrieval routing
router.get("/ingest-docs", ingestDocuments);
router.get("/retrieve-similar-documents", retrieveSimilarDocs);
router.get("/basic-retrieval", basicRetrieval);

router.get("/agentic-retrieval", classifyAndRetrieveExercise);

export default router;
