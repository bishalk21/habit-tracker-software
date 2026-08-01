import path from "path";
import { openai } from "../../utils/ai-openai.js";
import { fileURLToPath } from "url";
import fs from "fs";
import { supabase } from "../../config/supabaseConfig.js";
import {
  ANSWERING_MODEL_NAME,
  CLEAR_SUPABASE_TABLE_BEFORE_INSERT,
  EMBEDDING_MODEL_NAME,
  SIMILARITY_MATCH_COUNT,
  SOURCE_DOCUMENTS_DIR,
  SUPABASE_TABLE_NAME,
} from "../../utils/constants.js";
import { combineDocuments, getRagPrompt } from "./getRagPrompt.js";

// GET __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the directory name of the current file

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
      try {
        const embeddings = await openai.embeddings.create({
          model: EMBEDDING_MODEL_NAME,
          input: fileContent,
        });
        // add metadata with source filename to the embeddings
        const documentToInsert = {
          content: fileContent,
          embedding: embeddings.data[0].embedding,
          metadata: { source: file }, // Store the source filename in metadata
        };
        allDocumentsToInsert.push(documentToInsert);
        console.log(`- embedded content from file: ${file}`);
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
  const query = "In 1843, what was the key milestone in computing?";
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
