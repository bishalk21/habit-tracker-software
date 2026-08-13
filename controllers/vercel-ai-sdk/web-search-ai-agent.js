/**
 * OpenAI's Responses API has a built-in web search tool that can be used to search the web and return search results.
 * This tool is called web_search_preview and is accessed via the openai provider.
 */
import { generateText } from "ai";
import { openai } from "./config/config.js";
import { LLM_MODEL_NAME } from "../../utils/constants.js";
import { webSearchRetrievalAgent } from "./web-search/webSearchRetrievalAgent.js";

const retrievalQuery = "How do I access the scrimba discord?";
const webSearchQuery = "What is the latest openai large language model?";

export async function webSearchAgent(req, res) {
  const { question } = req.body;
  try {
    // const { text, sources } = await webSearch(webSearchQuery);
    // res.json({ text, sources });
    const response = await webSearchRetrievalAgent(question);
    res.json({
      response: response.text,
      answer: response.answer,
      sources: response.sources,
      retrievedDocuments: response.retrievedDocuments,
    });
  } catch (error) {
    console.error("Error in webSearchAgent:", error);
    res
      .status(500)
      .json({ error: "An error occurred while performing the web search." });
  }
}

async function webSearch(query) {
  const { text, sources } = await generateText({
    model: openai.responses(LLM_MODEL_NAME),
    prompt: query,
    tools: {
      web_search_preview: openai.tools.webSearchPreview({}),
    },
  });

  return { text, sources };

  console.log(`Text: ${text}\n\n`);
  console.log(`Sources: ${sources}`);
}
