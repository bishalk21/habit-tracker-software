import { createOpenAI } from "@ai-sdk/openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI API Key is missing or invalid.");
}

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// export const OPENAI_MODEL_NAME = openai("gpt-5.6-luna"); // Use the appropriate model for AI tasks
export const OPENAI_MODEL_NAME = openai("gpt-4o"); // Use the appropriate model for AI tasks
