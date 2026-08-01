export const SOURCE_DOCUMENTS_DIR = "../../mocks/vector-docs";
export const EMBEDDING_MODEL_NAME = "text-embedding-3-small"; // Use the appropriate embedding model name
export const SUPABASE_TABLE_NAME = "texts"; // Name of the Supabase table to store embeddings
export const CLEAR_SUPABASE_TABLE_BEFORE_INSERT = true; // Set to true to clear the table before inserting new embeddings
export const SIMILARITY_MATCH_COUNT = 5; // Number of similar documents to retrieve from Supabase
export const ANSWERING_MODEL_NAME = "gpt-4o"; // Use the appropriate model for answering questions based on retrieved documents
