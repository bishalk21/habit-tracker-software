import { generateText } from "ai";
import { OPENAI_MODEL_NAME } from "./config/config.js";
import z from "zod";

export async function generateBasicStructuredOutput(req, res) {
  try {
    // const structuredOutput = await basicStructuredOutput();
    // const structuredOutput = await classificationStructuredOutput();
    const structuredOutput = await classificationStructuredOutputExercise();
    console.log("Structured Output:", structuredOutput);
    res.json(structuredOutput);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function basicStructuredOutput() {
  const sandwichOrderSchema = z.object({
    size: z.enum(["small", "medium", "large"]).describe("Size of the sandwich"),
    bread: z.string().describe("Type of bread for the sandwich"),
    toasted: z.boolean().describe("Whether the sandwich should be toasted"),
    toppings: z.array(z.string()).describe("List of toppings for the sandwich"),
    notes: z.string().optional().describe("Additional notes for the order"),
  });
  const prompt = `
Make a sandwich order with these details:
- small turkey sandwich on sourdough
- toppings: lettuce, tomato, pickles
- toasted: yes
- note: "cut in half"
  `.trim();
  const result = await generateText({
    model: OPENAI_MODEL_NAME,
    schemaName: "sandwich order",
    schemaDescription: "Structured output for a simple sandwich order.",
    schema: sandwichOrderSchema,
    // prompt: "Generate a sandwich order.",
    prompt: prompt,
  });
  return result;
}

/*
  Challenge:
  Classify a short user message into one of three categories:
    - "compliment"
    - "complaint"
    - "question"

  Required fields:
    - reasoning: string (brief explanation for the choice)
    - label: enum("compliment", "complaint", "question")

  Steps:
    A) Define a Zod schema named messageClassSchema.
    B) Use generateObject with:
       - schemaName: "message_classification"
       - schemaDescription: "Classify a user message."
       - schema: messageClassSchema
       - prompt: include the user message (provided below)
    C) Log the JSON to the console.

  Try with these messages (change the text to test yourself!):
    1) "Your app keeps crashing on startup. Please fix this ASAP!!!"
    2) "Love the new update—super smooth and fast!"
    3) "How do I export my data to a CSV?"
*/

async function classificationStructuredOutputExercise() {
  // TODO A: Define the schema
  const messageClassSchema = z.object({
    // reasoning: ...
    reasoning: z
      .string()
      .describe("Brief reasoning for the classification choice."),
    // label: ...
    label: z
      .enum(["compliment", "complaint", "question"])
      .describe("Category of the user message"),
  });

  // TODO B: Pick one message to classify:
  const message = "Your app keeps crashing on startup. Please fix this ASAP!!!";

  const result = await generateText({
    model: OPENAI_MODEL_NAME,
    schemaName: "message_classification",
    schemaDescription: "Classify a user message.",
    schema: messageClassSchema,
    prompt: "Classify the user message below:\n\n" + `Message: "${message}"`,
  });

  // TODO C: Print the result to the console
  console.log("Classification Result:", result.object);
  return result;
}

async function classificationStructuredOutput() {
  const result = await generateText({
    model: OPENAI_MODEL_NAME,
    schemaName: "customer_review", //make sure there are no spaces
    schemaDescription: "Classification of customer reviews.",
    schema: z.object({
      reasoning: z
        .string()
        .describe("Brief reasoning for the classification choice."),
      type: z
        .enum(["positive", "negative"]) // An enum type is a special data type that enables for a variable to be a set of predefined constants
        .describe("Sentiment of the customer review"),
    }),
    prompt:
      "Classify the customer review below" +
      "\n\n" +
      "I tried the app and it worked exactly as I expected.",
  });
  return result;
}
