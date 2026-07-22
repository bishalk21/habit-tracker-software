import express from "express";
import { getWeatherAndActivitySuggestions } from "../controllers/agentFunctions.js";
const router = express.Router();

router.get("/weather-activity", getWeatherAndActivitySuggestions);

export default router;
