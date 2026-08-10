import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { CLEAR_SUPABASE_TABLE_BEFORE_INSERT } from "../../utils/constants.js";
import { embed, generateText } from "ai";
import { openai, supabase } from "./config/config.js";
import { aiModel, EMBEDDING_MODEL_NAME } from "./constants.js";

const SOURCE_DOCUMENTS_DIR = "./docs";
const SUPABASE_TABLE_NAME = "documents"; // Name of the Supabase table to store documents
const SIMILARITY_MATCH_COUNT = 5; // Number of similar documents to retrieve

// fileURLToPath is used to convert the module URL to a file path, which can be useful for logging or debugging purposes.
const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
export async function ingestDocuments(req, res) {
  const docsDirPath = path.join(__dirName, SOURCE_DOCUMENTS_DIR);
  console.log(`Ingesting documents from directory: ${docsDirPath}`);

  const allDocumentsToIngest = [];
  try {
    if (
      !fs.existsSync(docsDirPath) ||
      !fs.lstatSync(docsDirPath).isDirectory()
    ) {
      console.error(
        `Directory does not exist or is not a directory: ${docsDirPath}`,
      );
      return res.status(400).json({
        status: "error",
        message: `Directory does not exist or is not a directory: ${docsDirPath}`,
      });
    }
    // read all files in the directory
    const files = fs.readdirSync(docsDirPath);
    if (files.length === 0) {
      console.error(`No files found in directory: ${docsDirPath}`);
      return res.status(400).json({
        status: "error",
        message: `No files found in directory: ${docsDirPath}`,
      });
    }
    console.log(`Found ${files.length} files in directory: ${docsDirPath}`);
    if (CLEAR_SUPABASE_TABLE_BEFORE_INSERT) {
      const { error: deleteError } = await supabase
        .from(SUPABASE_TABLE_NAME)
        .delete()
        .neq("id", -1); // Delete all rows except the one with id -1

      if (deleteError) {
        console.error(
          `Error clearing Supabase table ${SUPABASE_TABLE_NAME}:`,
          deleteError,
        );
        return res.status(500).json({
          status: "error",
          message: `Error clearing Supabase table ${SUPABASE_TABLE_NAME}: ${deleteError.message}`,
        });
      } else {
        console.log(
          `Cleared Supabase table ${SUPABASE_TABLE_NAME} before inserting new documents.`,
        );
      }
    }

    // process each file and insert into Supabase
    for (const filename of files) {
      const filepath = path.join(docsDirPath, filename);
      // read the file content
      const fileContent = fs.readFileSync(filepath, "utf-8");
      try {
        const { embedding } = await embed({
          model: openai.embedding(EMBEDDING_MODEL_NAME),
          value: fileContent,
        });
        // add metadata and embedding to the document object
        const documentToIngest = {
          content: fileContent,
          embedding: embedding,
          metadata: {
            source: filename,
          },
        };
        console.log(
          `Processed file: ${filename}, embedding length: ${embedding.length}`,
        );
        allDocumentsToIngest.push(documentToIngest);
      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
      }
    }
    console.log(
      `Total documents processed for ingestion: ${allDocumentsToIngest.length}`,
    );
    if (allDocumentsToIngest.length === 0) {
      console.error("No documents were processed successfully.");
      return res.status(400).json({
        status: "error",
        message: "No documents were processed successfully.",
      });
    }
    // insert all documents into Supabase
    const { error: insertError } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .insert(allDocumentsToIngest);
    if (insertError) {
      console.error(
        `Error inserting documents into Supabase table ${SUPABASE_TABLE_NAME}:`,
        insertError,
      );
      return res.status(500).json({
        status: "error",
        message: `Error inserting documents into Supabase table ${SUPABASE_TABLE_NAME}: ${insertError.message}`,
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully ingested ${allDocumentsToIngest.length} documents into Supabase table ${SUPABASE_TABLE_NAME}.`,
    });
  } catch (error) {
    console.error("Unexpected error occurred:", error);
    return res.status(500).json({
      status: "error",
      message: "An unexpected error occurred while ingesting documents.",
    });
  }
}

// store docs in supabase as vector embeddings with metadata
// retrieving docs from supabase for a given query

const query = "Do your lessons have captions?";
export async function basicRetrieval() {
  const docs = await retrieveSimilarDocs(query);
  if (!docs || docs.length === 0) {
    console.log("[Normal] No relevant documents found.");
  }
  const contextStr = combineDocs(docs);
  console.log(contextStr);

  const prompt = ragPrompt(contextStr, query);
  console.log(prompt);
  const { text: answer } = await generateText({
    model: aiModel,
    prompt: prompt,
  });
  console.log(answer);
}

function ragPrompt(combinedStr, query) {
  return `You are a helpful assistant. Answer the user's question based on the provided context. If the context doesn't contain the answer, kindly inform the user.
  Context: ${combinedStr}
  Question: ${query}
  Answer: `;
}

async function retrieveSimilarDocs(query) {
  try {
    const { embedding } = await embed({
      model: openai.embeddingModel(EMBEDDING_MODEL_NAME),
      value: query,
    });

    console.log("embedding:", embedding);
    // retrieve similar docs from supabase
    const { data: docs, error: matchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: embedding,
        match_count: SIMILARITY_MATCH_COUNT,
      },
    );
    console.log("docs:", docs);
    if (matchError) {
      console.error("Error matching documents:", matchError);
      throw new Error(`Failed to retrieve documents: ${matchError.message}`);
    }
    return docs;
  } catch (error) {
    console.error("Error retrieving similar documents:", error);
    throw new Error(`Failed to retrieve similar documents: ${error.message}`);
  }
}

function combineDocs(docs) {
  return docs.map((doc) => doc.content).join("\n\n---\n\n");
}
