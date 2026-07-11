import { InferenceClient } from "@huggingface/inference";
import { OpenAI } from "openai";
const openai = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});
const client = new InferenceClient(process.env.HF_TOKEN);

export async function huggingFaceFunction() {
  console.log(client);
}

export async function callHuggingFaceFunction() {
  try {
    const text = await huggingFaceFunction();
    return {
      status: "success",
      message: "Hugging Face function executed successfully",
      data: text,
    };
  } catch (error) {
    console.error("Error occurred while calling Hugging Face function:", error);
    return {
      status: "error",
      message: "Failed to call Hugging Face function",
    };
  }
}

const inputText =
  "A cherry blossom is the flower from a Prunus tree, of which there are many different kinds. Species cherry blossoms are found throughout the world being especially common in regions in the Northern Hemisphere with temperate climates, including Japan, China, and Korea, as well as Nepal, India, Pakistan, Iran, and Afghanistan, and several areas across northern Europe.Japan is particularly famous for its cherry blossom due its large number of varieties and the nationwide celebrations during the blooming season. As the buds burst open in parks and streets across the country, people throw picnic and hanami (flower viewing) parties to appreciate the transient beauty of the flowers and welcome in the warmer weather. Cherry blossoms in Japanese are known as sakura and it would not be an exaggeration to say they are a national obsession.";

export async function summarizeText(req, res) {
  const { text } = req.body;
  try {
    const summary = await client.summarization({
      inputs: text,
      model: "facebook/bart-large-cnn",
      provider: "hf-inference",
    });
    res.status(200).json({
      status: "success",
      message: "Text summarization executed successfully",
      data: summary,
    });
  } catch (error) {
    console.error("Error occurred while summarizing text:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to summarize text",
    });
  }
}

// text classification
export async function classifyText(req, res) {
  const { text } = req.body;
  try {
    const classification = await client.textClassification({
      model: "distilbert/distilbert-base-uncased-finetuned-sst-2-english",
      inputs: text,
      provider: "hf-inference",
    });
    res.status(200).json({
      status: "success",
      message: "Text classification executed successfully",
      data: classification,
    });
  } catch (error) {
    console.error("Error occurred while classifying text:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to classify text",
    });
  }
}

// chat completion

export async function chatCompletions(req, res) {
  const { userMessage } = req.body;
  try {
    const response = await client.chatCompletion({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides concise and accurate responses to user queries.",
        },
        {
          role: "user",
          content:
            // "Hello, can you provide a brief summary of the latest advancements in AI research?",
            userMessage,
        },
      ],
    });
    const finalResponse = response.choices[0].message;
    res.status(200).json({
      status: "success",
      message: "Chat completion executed successfully",
      data: finalResponse,
    });
  } catch (error) {
    console.error("Error occurred while generating chat completion:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate chat completion",
    });
  }
}
