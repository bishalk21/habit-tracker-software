import { embed, generateObject, generateText, Output } from "ai";
import {
  getClassificationPrompt,
  getFallbackPrompt,
  getGeneralPrompt,
} from "./prompts.js";
import { openai, supabase } from "./config/config.js";
import {
  aiModel,
  ANSWERING_MODEL,
  EMBEDDING_MODEL_NAME,
  KNOWLEDGE_BASE_DESCRIPTION,
  SIMILARITY_MATCH_COUNT,
} from "./constants.js";
import { combineDocuments, getRagPrompt } from "./utils.js";
import z from "zod";

const EXERCISE_QUESTION = "Do your lessons have captions?";
export async function classifyAndRetrieveExercise() {
  console.log(`[Normal] Received question: ${EXERCISE_QUESTION}`);
  try {
    // 1. Classify Question Type
    console.log("[Normal] Classifying question...");
    const classificationPrompt = getClassificationPrompt(
      EXERCISE_QUESTION,
      KNOWLEDGE_BASE_DESCRIPTION,
    );
    const { output: classification } = await generateText({
      model: aiModel,
      /**
       * 1. Construct the schema using enum type for 'RETRIEVAL' and 'GENERAL'
       * 2. Add a property for the prompt sent to the model
       *
       */

      output: Output.object({
        schema: z.object({
          type: z
            .enum(["RETRIEVAL", "GENERAL"])
            .describe(
              "Type of classification: 'RETRIEVAL' for retrieval-based questions, 'GENERAL' for general questions",
            ),
          reasoning: z
            .string()
            .describe("Reasoning behind the classification decision"),
        }),
      }),
      prompt: classificationPrompt,
      maxOutputTokens: 100,
      temperature: 0, //controls randomness. Closer to 0 means less random outputs
    });
    console.log(
      `[Normal] Classification result: ${JSON.stringify(classification)}`,
    );
    const decision = classification.type.trim().toUpperCase();
    console.log(
      `classification info: ${JSON.stringify(classification, null, 2)}`,
    );
    console.log(
      `classification type: ${classification.type.trim().toUpperCase()}`,
    );
    // 2. Handle Based on Classification
    if (decision === "GENERAL") {
      console.log("[Normal] Answering as a general question...");
      const generalPrompt = getGeneralPrompt(EXERCISE_QUESTION);
      const { text: generalAnswer } = await generateText({
        model: openai(ANSWERING_MODEL),
        prompt: generalPrompt,
      });
      console.log("[Normal] Generated general answer.");
      return { answer: generalAnswer, sources: null };
    } else if (decision === "RETRIEVAL") {
      console.log("[Normal] Performing retrieval...");
      const { embedding } = await embed({
        model: openai.embeddingModel(EMBEDDING_MODEL_NAME),
        value: EXERCISE_QUESTION,
      });
      console.log("[Normal] Generated question embedding.");

      const { data: documents, error: matchError } = await supabase.rpc(
        "match_documents",
        {
          query_embedding: embedding,
          match_count: SIMILARITY_MATCH_COUNT,
        },
      );

      if (matchError) {
        console.error("[Normal] Error matching documents:", matchError);
        throw new Error(`Failed to retrieve documents: ${matchError.message}`);
      }

      if (!documents || documents.length === 0) {
        console.log("[Normal] No relevant documents found.");
        const fallbackPrompt = getFallbackPrompt(
          EXERCISE_QUESTION,
          KNOWLEDGE_BASE_DESCRIPTION,
        );
        const { text: fallbackAnswer } = await generateText({
          model: aiModel,
          prompt: fallbackPrompt,
        });
        return { answer: fallbackAnswer, sources: null };
      }

      console.log(`[Normal] Retrieved ${documents.length} document chunks.`);
      const retrievedSources = documents;
      console.log("[Normal] Retrieved sources:", retrievedSources);
      const contextString = combineDocuments(retrievedSources);

      const ragPrompt = getRagPrompt(
        contextString,
        EXERCISE_QUESTION,
        KNOWLEDGE_BASE_DESCRIPTION,
      );

      console.log("[Normal] Generating RAG answer...");
      const { text: ragAnswer } = await generateText({
        model: openai(ANSWERING_MODEL),
        prompt: ragPrompt,
      });
      console.log("[Normal] Generated RAG answer.");
      const typedSources = retrievedSources.map((source) => ({
        ...source,
        type: "knowledgeBase",
      }));
      console.log("[Normal] Typed sources:", typedSources);
      console.log("[Normal] RAG answer:", ragAnswer);
      return { answer: ragAnswer, sources: typedSources };
    } else {
      console.warn(
        `[Normal] Unexpected classification result: ${classification}. Defaulting to general answer.`,
      );
      const generalPrompt = getGeneralPrompt(question);
      const { text: generalAnswer } = await generateText({
        model: openai(ANSWERING_MODEL),
        prompt: generalPrompt,
      });
      return { answer: generalAnswer, sources: null };
    }
  } catch (error) {
    console.error(
      "[Normal] Error in exercise classification and retrieval:",
      error,
    );
    const errorAnswer =
      "I encountered an error while processing your request. Please try again later.";
    return { answer: errorAnswer, sources: null };
  }
}

export async function classifyAndRetrieve(question) {
  console.log(`[Normal] Received question: ${question}`);

  try {
    // 1. Classify Question Type
    console.log("[Normal] Classifying question...");
    const classificationPrompt = getClassificationPrompt(
      question,
      KNOWLEDGE_BASE_DESCRIPTION,
    );

    const { text: classification } = await generateText({
      model: openai(CLASSIFICATION_MODEL),
      prompt: classificationPrompt,
      maxOutputTokens: 20,
      temperature: 0, //controls randomness. Closer to 0 means less random outputs
    });

    const decision = classification.trim().toUpperCase();
    console.log(`[Normal] Classification result: ${decision}`);

    // 2. Handle Based on Classification
    if (decision === "GENERAL") {
      console.log("[Normal] Answering as a general question...");
      const generalPrompt = getGeneralPrompt(question);
      const { text: generalAnswer } = await generateText({
        model: openai(ANSWERING_MODEL),
        prompt: generalPrompt,
      });
      console.log("[Normal] Generated general answer.");
      return { answer: generalAnswer, sources: null };
    } else if (decision === "RETRIEVAL") {
      console.log("[Normal] Performing retrieval...");
      const { embedding } = await embed({
        model: openai.embeddingModel(EMBEDDING_MODEL_NAME),
        value: question,
      });
      console.log("[Normal] Generated question embedding.");

      const { data: documents, error: matchError } = await supabase.rpc(
        "match_documents",
        {
          query_embedding: embedding,
          match_count: SIMILARITY_MATCH_COUNT,
        },
      );

      if (matchError) {
        console.error("[Normal] Error matching documents:", matchError);
        throw new Error(`Failed to retrieve documents: ${matchError.message}`);
      }

      if (!documents || documents.length === 0) {
        console.log("[Normal] No relevant documents found.");
        const fallbackPrompt = getFallbackPrompt(
          question,
          KNOWLEDGE_BASE_DESCRIPTION,
        );
        const { text: fallbackAnswer } = await generateText({
          model: openai(ANSWERING_MODEL),
          prompt: fallbackPrompt,
        });
        return { answer: fallbackAnswer, sources: null };
      }

      console.log(`[Normal] Retrieved ${documents.length} document chunks.`);
      const retrievedSources = documents;
      const contextString = combineDocuments(retrievedSources);

      const ragPrompt = getRagPrompt(
        contextString,
        question,
        KNOWLEDGE_BASE_DESCRIPTION,
      );

      console.log("[Normal] Generating RAG answer...");
      const { text: ragAnswer } = await generateText({
        model: openai(ANSWERING_MODEL),
        prompt: ragPrompt,
      });
      console.log("[Normal] Generated RAG answer.");
      const typedSources = retrievedSources.map((source) => ({
        ...source,
        type: "knowledgeBase",
      }));
      return { answer: ragAnswer, sources: typedSources };
    } else {
      console.warn(
        `[Normal] Unexpected classification result: ${classification}. Defaulting to general answer.`,
      );
      const generalPrompt = getGeneralPrompt(question);
      const { text: generalAnswer } = await generateText({
        model: openai(ANSWERING_MODEL),
        prompt: generalPrompt,
      });
      return { answer: generalAnswer, sources: null };
    }
  } catch (error) {
    console.error("[Normal] Error in RAG process:", error);
    const errorAnswer =
      "I encountered an error while processing your request. Please try again later.";
    return { answer: errorAnswer, sources: null };
  }
}
