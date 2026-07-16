import { createClient } from "@supabase/supabase-js";

const privateKey = process.env.SUPABASE_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
if (!privateKey || !supabaseUrl) {
  throw new Error(
    "Missing SUPABASE_API_KEY or SUPABASE_URL in environment variables",
  );
}

export const supabase = createClient(supabaseUrl, privateKey);
