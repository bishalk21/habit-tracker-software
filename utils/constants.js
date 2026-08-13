export const SOURCE_DOCUMENTS_DIR = "../../mocks/vector-docs";
export const EMBEDDING_MODEL_NAME = "text-embedding-3-small"; // Use the appropriate embedding model name
export const SUPABASE_TABLE_NAME = "texts"; // Name of the Supabase table to store embeddings
export const CLEAR_SUPABASE_TABLE_BEFORE_INSERT = true; // Set to true to clear the table before inserting new embeddings
export const SIMILARITY_MATCH_COUNT = 5; // Number of similar documents to retrieve from Supabase
export const ANSWERING_MODEL_NAME = "gpt-4o"; // Use the appropriate model for answering questions based on retrieved documents
export const MATCH_THRESHOLD = 0.5; // Similarity threshold for matching documents (adjust as needed)
export const CHUNK_SIZE = 2000; // Size of each text chunk for embeddings
export const CHUNK_OVERLAP = 100; // Overlap between text chunks for embeddings

export const OPENAI_MODEL_NAME = "gpt-4o"; // Use the appropriate model for AI tasks
export const LLM_MODEL_NAME = "gpt-4o-mini"; // Use the appropriate model for AI tasks

export const KNOWLEDGE_BASE_DESCRIPTION =
  "Scrimba, an online platform for learning to code";
