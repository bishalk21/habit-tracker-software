import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";
import { readFileSync } from "fs";
import { openai } from "../utils/ai-openai.js";
import { supabase } from "../config/supabaseConfig.js";

//langchain text splitter for splitting text into chunks
export async function splitTextIntoChunks() {
  //   const response = await fetch("/mocks/podcasts.txt");
  //   const text = await response.text();
  const text = readFileSync("mocks/podcasts.txt", "utf-8");
  console.log("Text length:", text.length, text);
  const textSplitter = new CharacterTextSplitter({
    // separator: "\n\n", // Split on double newlines
    separator: " ",
    chunkSize: 150, // maximum number of characters in each chunk
    chunkOverlap: 15, // number of characters to overlap between chunks
  });
  const chunks = await textSplitter.createDocuments([text]);
  console.log("Number of chunks:", chunks.length, chunks);
}

// splitTextIntoChunks();

/*
  Challenge: Text Splitters, Embeddings, and Vector Databases!
    1. Use LangChain to split the content in movies.txt into smaller chunks.
    2. Use OpenAI's Embedding model to create an embedding for each chunk.
    3. Insert all text chunks and their corresponding embedding
       into a Supabase database table.
 */

/* Split movies.txt into text chunks.
Return LangChain's "output" – the array of Document objects. */
export async function splitDocument() {
  try {
    const text = readFileSync("mocks/movies.txt", "utf-8");
    const textSplitter = new RecursiveCharacterTextSplitter({
      separator: "\n\n", // Split on double newlines
      chunkSize: 250, // maximum number of characters in each chunk
      chunkOverlap: 35, // number of characters to overlap between chunks
    });
    const chunks = await textSplitter.createDocuments([text]);
    return chunks;
  } catch (error) {
    console.error("Error splitting document:", error);
    throw error;
  }
}

/* Create an embedding from each text chunk.
Store all embeddings and corresponding text in Supabase. */
export async function createEmbeddingsAndStoreInSupabase(req, res) {
  try {
    const chunks = await splitDocument();
    console.log("Number of chunks created:", chunks.length, chunks);
    // Implementation for creating embeddings and storing in Supabase would go here
    const embeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk.pageContent,
        });
        //   console.log("Embedding created for chunk:", chunk.pageContent);
        return {
          content: chunk.pageContent,
          embedding: embeddingResponse.data[0].embedding,
        };
      }),
    );
    const { error } = await supabase.from("movies").insert(embeddings);
    if (error) {
      console.error("Error inserting embeddings into the database:", error);
      return res.status(500).json({ error: "Failed to insert embeddings" });
    }
    console.log("Embeddings inserted into the database successfully.");
    res.json({ message: "Embeddings inserted successfully" });
  } catch (error) {
    console.error("Error creating embeddings and storing in Supabase:", error);
    throw error;
  }
}

// conversational response
// const query = "which movie is best for family";
// const query = "Which movie can I take my child to?";
const query = "which movie gives me adrenaline rush and is thrilling?";
// http://localhost:3001/api/lc-chat-response?query=${encodeURIComponent(input)
export async function generateConversationalResponse(req, res) {
  try {
    const query = req.query.query;
    const embedding = await createEmbeddingsForMovies(query);
    // console.log("Embedding created for query:", embedding.data[0].embedding);
    const match = await findSimilarMovies(embedding);
    console.log("Matched movies:", match);
    // Do something with the matched movies, e.g., send them in the response
    // const response = await getConversationalResponse(match, query);
    const responses = await getConversationalResponse(match, query);
    res.json({ message: "Conversational response generated", data: responses });
  } catch (error) {
    console.error("Error generating conversational response:", error);
    res
      .status(500)
      .json({ error: "Failed to generate conversational response" });
  }
}

export async function createEmbeddingsForMovies(query) {
  try {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });
    return embedding;
  } catch (error) {
    console.error("Error creating embedding for movie:", error);
    throw error;
  }
}

export async function findSimilarMovies(embedding) {
  try {
    const { data, error } = await supabase.rpc("match_movies", {
      query_embedding: embedding.data[0].embedding,
      match_threshold: 0.5,
      match_count: 3,
    });
    const match = data.map((item) => item.content).join("\n");
    return match;
  } catch (error) {
    console.error("Error finding similar movies:", error);
    throw error;
  }
}

export async function getConversationalResponse(match, query) {
  try {
    const chatMessages = [
      {
        role: "system",
        content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If the answer is not given in the context, find the answer in the conversation history if possible. If you are unsure and cannot find the answer, say, "Sorry, I don't know the answer." Please do not make up the answer. Always speak as if you were chatting to a friend.`,
      },
    ];
    //  add the previous conversation history to the messages array to maintain context in the conversation. This allows the model to generate responses that are informed by the entire conversation, rather than just the latest user input.
    chatMessages.push({
      role: "user",
      content: `Context: ${match}\n\nQuestion: ${query}`,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0.7,
      frequency_penalty: 0.5,
    });
    chatMessages.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating conversational response:", error);
    throw error;
  }
}
