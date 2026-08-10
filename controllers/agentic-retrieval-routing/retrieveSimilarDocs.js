import { embed } from "ai";
import { openai, supabase } from "./config/config.js";
import { EMBEDDING_MODEL_NAME, SIMILARITY_MATCH_COUNT } from "./constants.js";

const query = "Do your lessons have captions?";
export async function retrieveSimilarDocs(req, res) {
  // Create vector embeddings based on the query

  const { embedding } = await embed({
    model: openai.textEmbeddingModel(EMBEDDING_MODEL_NAME),
    value: query,
  });

  //retrieve similar docs from supabase based on embeddings
  const { data: documents, error: matchError } = await supabase.rpc(
    "match_documents",
    {
      query_embedding: embedding,
      match_count: SIMILARITY_MATCH_COUNT,
    },
  );

  if (matchError) {
    return res.status(500).json({
      status: "error",
      message: `Failed to fetch docs from supabase. Error: ${matchError}`,
    });
  }
  return res.status(200).json({
    status: "success",
    message: `Successfully retrieved ${documents.length} similar documents from Supabase.`,
    data: documents,
  });
}
