import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI API Key is missing or invalid.");
}

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// export const OPENAI_MODEL_NAME = openai("gpt-5.6-luna"); // Use the appropriate model for AI tasks
export const OPENAI_MODEL_NAME = openai("gpt-4o"); // Use the appropriate model for AI tasks

const privateKey = process.env.SUPABASE_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
if (!privateKey || !supabaseUrl) {
  throw new Error(
    "Missing SUPABASE_API_KEY or SUPABASE_URL in environment variables",
  );
}

export const supabase = createClient(supabaseUrl, privateKey);
