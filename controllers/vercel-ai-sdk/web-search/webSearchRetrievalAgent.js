import { generateText, stepCountIs } from "ai";
import {
  ANSWERING_MODEL_NAME,
  KNOWLEDGE_BASE_DESCRIPTION,
} from "../../../utils/constants.js";
import { openai } from "../config/config.js";
import { knowledgeBaseTool } from "../tools/knowledgeBaseTool.js";
import { getRetrievalWebSearchPrompt } from "../prompts.js";

const TOOL_CALLING_MODEL = ANSWERING_MODEL_NAME;
const MAX_TOOL_STEPS = 3; // Allow LLM to call tool then generate response

/**
 * Gets a llm response using tool calling for KB retrieval OR web search.
 */
export async function webSearchRetrievalAgent(question) {
  console.log(`[ToolBased] Received question: ${question}`);

  // Define the tools available to the model
  const tools = {
    // Our custom knowledge base tool
    knowledgeBaseSearch: knowledgeBaseTool,
    // OpenAI's built-in web search tool
    web_search_preview: openai.tools.webSearchPreview({}), // No additional config needed for this tool
  };

  try {
    // Single call to generateText, letting the LLM decide on tool use
    const result = await generateText({
      model: openai.responses(TOOL_CALLING_MODEL),
      tools: tools,
      // Limit the number of steps to prevent infinite loops
      stopWhen: stepCountIs(MAX_TOOL_STEPS),
      // System prompt guides the LLM on its role and when to use tools
      system: getRetrievalWebSearchPrompt(KNOWLEDGE_BASE_DESCRIPTION),
      prompt: question,
    });

    console.log("[ToolBased] generateText finished.");

    // --- Extract results ---
    let answer = result.text;
    let sources = null;
    let toolUsed = null;

    // Check if web search was used (OpenAI response structure)
    if (result.sources && result.sources.length > 0) {
      console.log("[ToolBased] Web search sources found.");
      sources = result.sources.map((s) => ({
        // Adapt to our expected format
        type: "web",
        title: s.title,
        url: s.url,
        snippet: s.snippet,
      }));
      toolUsed = "web_search_preview";
    }

    // Check if our knowledge base tool was called by looking at steps
    // This requires inspecting the intermediate steps
    const kbToolCall = result.steps?.find((step) =>
      step.toolCalls?.some((tc) => tc.toolName === "knowledgeBaseSearch"),
    );

    if (kbToolCall) {
      console.log("[ToolBased] Knowledge base tool call detected in steps.");
      toolUsed = "knowledgeBaseSearch"; // Prioritize showing KB if both potentially used?

      // Find the corresponding tool result
      const kbToolResultStep = result.steps?.find(
        (step) =>
          step.toolResults?.some(
            (tr) => tr.toolCallId === kbToolCall.toolCalls[0].toolCallId,
          ), // Assuming one call per step for KB
      );
      const kbResultData = kbToolResultStep?.toolResults[0]?.output;

      if (kbResultData?.retrievedDocuments) {
        console.log("[ToolBased] Extracted KB documents from tool result.");
        sources = kbResultData.retrievedDocuments.map((doc) => ({
          // Adapt to our format
          type: "knowledgeBase",
          content: doc.content,
          metadata: doc.metadata,
          similarity: doc.similarity,
        }));
      } else if (kbResultData?.info) {
        console.log("[ToolBased] KB tool returned 'info':", kbResultData.info);
      } else if (kbResultData?.error) {
        console.warn(
          "[ToolBased] KB tool returned an error:",
          kbResultData.error,
        );
      }
    }

    // If no text was generated but tools were called, provide a summary
    if (!answer.trim() && toolUsed) {
      answer = `I used the ${
        toolUsed === "web_search_preview" ? "web search" : "knowledge base"
      } tool but didn't generate a final summary. You can check the retrieved sources.`;
    }

    return {
      answer: answer || "I couldn't generate a response.",
      sources: sources,
      retrievedDocuments:
        sources?.filter((s) => s.type === "knowledgeBase") || [],
      toolUsed: toolUsed, // Indicate which tool (if any) was used
    };
  } catch (error) {
    console.error("[ToolBased] Error in RAG process:", error);
    const errorAnswer =
      "I encountered an error while processing your request using tool calling. Please try again later.";
    return { answer: errorAnswer, sources: null, toolUsed: null };
  }
}
