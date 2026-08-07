import express from "express";
import {
  generateEmbeddings,
  generateResponse,
  generateResponseAndCreateEmbeddings,
} from "../../controllers/vercel-ai-sdk/vercel-ai-sdk.js";
import { generateBasicStructuredOutput } from "../../controllers/vercel-ai-sdk/vercel-ai-structured-outputs.js";
import {
  basicWeatherToolCalling,
  toolCalling,
} from "../../controllers/vercel-ai-sdk/vercel-ai-tool-calling.js";
const router = express.Router();

// Route for generating a response and creating embeddings using the Vercel AI SDK
router.get(
  "/generate-response-and-embeddings",
  generateResponseAndCreateEmbeddings,
);
// Route for generating a response using the Vercel AI SDK
router.get("/generate-response", generateResponse);
// for generating embeddings, you can add a route like this:
router.get("/generate-embeddings", generateEmbeddings);

// structured output route
router.get("/generate-basic-structured-output", generateBasicStructuredOutput);

// vercel ai sdk tool calling route
router.get("/tool-calling", toolCalling);

export default router;
