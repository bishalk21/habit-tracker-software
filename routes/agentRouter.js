import express from "express";
import { getWeatherAndActivitySuggestions } from "../controllers/agentFunctions.js";
import {
  autoFunctionCallingAgent,
  openAIFunctionAgent,
} from "../controllers/openAIfunctionAgent.js";
const router = express.Router();

router.get("/weather-activity", getWeatherAndActivitySuggestions);
router.get("/openai-function-agent", autoFunctionCallingAgent);
router.get("/openai-function-agent", openAIFunctionAgent);

export default router;
