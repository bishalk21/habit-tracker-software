import express from "express";
import { getWeatherAndActivitySuggestions } from "../agent/agent.js";
const router = express.Router();

router.get("/weather-activity", getWeatherAndActivitySuggestions);

export default router;
