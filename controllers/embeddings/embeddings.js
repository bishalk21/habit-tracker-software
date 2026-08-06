import path from "path";
import { openai } from "../../utils/ai-openai.js";
import { fileURLToPath } from "url";
import fs from "fs";
import { supabase } from "../../config/supabaseConfig.js";
import {
  ANSWERING_MODEL_NAME,
  CHUNK_OVERLAP,
  CHUNK_SIZE,
  CLEAR_SUPABASE_TABLE_BEFORE_INSERT,
  EMBEDDING_MODEL_NAME,
  MATCH_THRESHOLD,
  SIMILARITY_MATCH_COUNT,
  SOURCE_DOCUMENTS_DIR,
  SUPABASE_TABLE_NAME,
} from "../../utils/constants.js";
import { combineDocuments, getRagPrompt } from "./getRagPrompt.js";
import { simpleTextSplitter } from "./simpleTextSplitter.js";

// GET __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the directory name of the current file

/**
 * 1. get the source documents from the source directory (path.join(__dirname, SOURCE_DOCUMENTS_DIR))
 * 2. read the content of each document (fs.readFileSync)
 * 3.
 */
export async function ingestDocumentsAndGenerateEmbeddings(req, res) {
  const sourceDir = path.join(__dirname, SOURCE_DOCUMENTS_DIR); // Path to the directory containing source documents
  console.log(`Ingesting documents from: ${sourceDir}`);

  // store all documents to insert across all files
  const allDocumentsToInsert = [];

  try {
    if (!fs.existsSync(sourceDir) || !fs.lstatSync(sourceDir).isDirectory()) {
      throw new Error(
        `Source documents directory does not exist or is not a directory: ${sourceDir}`,
      );
    }
    // Read all files in the source directory
    const files = fs.readdirSync(sourceDir);
    if (files.length === 0) {
      console.log(
        `No files found in the source documents directory: ${sourceDir}`,
      );
      return res
        .status(404)
        .json({ error: "No source documents found to ingest." });
    }
    console.log(`Found ${files.length} files in the source directory.`);
    if (CLEAR_SUPABASE_TABLE_BEFORE_INSERT) {
      // Clear the Supabase table before inserting new embeddings
      const { data: deleteData, error: deleteError } = await supabase
        .from(SUPABASE_TABLE_NAME)
        .delete()
        .neq("id", -1); // Delete all rows
      if (deleteError) {
        console.error("Error clearing Supabase table:", deleteError);
        return res
          .status(500)
          .json({ error: "Failed to clear Supabase table before inserting." });
      } else {
        console.log(
          `Cleared Supabase table '${SUPABASE_TABLE_NAME}' before inserting new embeddings.`,
        );
      }
    }

    // Process each file and generate embeddings
    for (const file of files) {
      const filePath = path.join(sourceDir, file);
      console.log(`Processing file: ${filePath}`);
      //   Read the content of the file
      const fileContent = fs.readFileSync(filePath, "utf-8");
      console.log(`File content: ${fileContent}`);
      //   Generate embeddings for the file content

      //   split the large text into chunks
      const chunks = simpleTextSplitter(fileContent, CHUNK_SIZE, CHUNK_OVERLAP);

      if (chunks.length === 0) {
        console.log(`No chunks generated for file: ${file}`);
        continue; // Skip to the next file if no chunks were generated
      }

      let fileChunkCount = 0;
      try {
        for (const chunk of chunks) {
          fileChunkCount++;
          const embeddings = await openai.embeddings.create({
            model: EMBEDDING_MODEL_NAME,
            input: chunk,
          });
          // add metadata with source filename to the embeddings
          const documentToInsert = {
            content: chunk,
            embedding: embeddings.data[0].embedding,
            metadata: { source: file }, // Store the source filename in metadata
          };
          allDocumentsToInsert.push(documentToInsert);
          console.log(
            `- embedded content from file: ${file}, ${documentToInsert.content}`,
          );
        }
      } catch (error) {
        console.error(
          `Error generating embeddings for file ${filePath}:`,
          error,
        );
      }
    }
    if (allDocumentsToInsert.length === 0) {
      console.log("No embeddings generated for any files.");
      return res
        .status(500)
        .json({ error: "No embeddings generated for any files." });
    }
    console.log(
      `Inserting ${allDocumentsToInsert.length} documents with embeddings into Supabase table '${SUPABASE_TABLE_NAME}'...`,
    );
    // Insert all documents with embeddings into Supabase
    const { data: insertData, error: insertError } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .insert(allDocumentsToInsert);
    if (insertError) {
      console.error("Error inserting documents into Supabase:", insertError);
      return res
        .status(500)
        .json({ error: "Failed to insert documents into Supabase." });
    } else {
      console.log(
        `Successfully inserted documents into Supabase table '${SUPABASE_TABLE_NAME}'.`,
      );
    }
    console.log(insertData);
    res.status(200).json({
      message: `Successfully ingested ${allDocumentsToInsert.length} documents and generated embeddings.`,
      insertedCount: allDocumentsToInsert.length,
      insertedData: insertData,
    });
  } catch (error) {
    console.error(
      "Error ingesting documents and generating embeddings:",
      error,
    );
    res
      .status(500)
      .json({ error: "Failed to ingest documents and generate embeddings" });
  }
}
/**
 * 1. generate vector embeddings for user query using OpenAI embeddings API
 * 2. retrieve similar documents from Supabase using the generated query embedding
 * 3. create a prompt including context docs to send to the LLM for RAG
 * 4. send the prompt to the LLM for RAG and get the response
 * 5. return the response to the user
 */
export async function getEmbeddings(req, res) {
  const content = "The quick brown fox jumps over the lazy dog.";
  try {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });

    res.json(embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    res.status(500).json({ error: "Failed to generate embeddings" });
  }
}

export async function retrieveSimilarDocuments(req, res) {
  const query = "How many houses were damaged during the great fire of london?";
  try {
    const queryEmbedding = await openai.embeddings.create({
      model: EMBEDDING_MODEL_NAME,
      input: query,
    });
    const embeddingVector = queryEmbedding.data[0].embedding;
    // Retrieve similar documents from Supabase based on the embedding vector
    const { data: similarDocs, error: matchError } = await supabase.rpc(
      "match_texts",
      {
        query_embedding: embeddingVector,
        match_count: SIMILARITY_MATCH_COUNT,
        match_threshold: MATCH_THRESHOLD,
      },
    );

    if (matchError) {
      console.error("Error retrieving similar documents:", matchError);
      return res
        .status(500)
        .json({ error: "Failed to retrieve similar documents" });
    }

    // create a prompt including context docs to send to the LLM for RAG
    const contextStr = combineDocuments(similarDocs);
    const ragPrompt = getRagPrompt(contextStr, query);
    const ragResponse = await openai.responses.create({
      model: ANSWERING_MODEL_NAME,
      input: ragPrompt,
    });
    res.json({
      query: query,
      context: contextStr,
      ragPrompt: ragPrompt,
      ragResponse: ragResponse.output_text,
    });
  } catch (error) {
    console.error("Error generating query embedding:", error);
    res.status(500).json({ error: "Failed to generate query embedding" });
  }
}
