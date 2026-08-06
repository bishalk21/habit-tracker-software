import { embed, generateText } from "ai";
import { openai, OPENAI_MODEL_NAME } from "./config/config.js";
import { EMBEDDING_MODEL_NAME } from "../../utils/constants.js";

export async function generateResponseAndCreateEmbeddings(req, res) {
  const userInput = "What are new advancements in AI technology, today?";

  // Generate a response using the Vercel AI SDK
  const aiResponse = await generateResponse();
  console.log("AI Response:", aiResponse);
  //   generate embeddings using the Vercel AI SDK
  const embeddings = await generateEmbeddings(aiResponse);

  res.status(200).json({
    status: "success",
    message: "Response and embeddings generated successfully",
    data: {
      response: aiResponse,
      embeddings: embeddings,
    },
  });
}

export async function generateResponse() {
  try {
    const response = await generateText({
      model: OPENAI_MODEL_NAME,
      prompt: "What are new advancements in AI technology, today?",
    });
    console.log("Generated Response:", response);
    return response.text;
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response");
  }
}

// for generating embeddings,
export async function generateEmbeddings(text) {
  try {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL_NAME),
      value: text,
    });
    return embedding;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
}
