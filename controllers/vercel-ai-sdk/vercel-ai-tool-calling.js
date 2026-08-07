import { generateText, stepCountIs, tool } from "ai";
import { OPENAI_MODEL_NAME } from "./config/config.js";
import z from "zod";

/**
 * Tools are actions that an LLM can invoke.
 * The results of these actions can be reported back to the LLM to be considered in the next response.
 */

export async function toolCalling(req, res) {
  //   const output = await basicWeatherToolCalling();
  //   const output = await multipleToolCalls();
  //   const output = await generateResponseFromToolCalls();
  //   const output = await singleToolCalling();
  //   const output = await multipleToolCalling();
  const output = await summarizeWithStopWhenExercise();
  res.json(output);
}

export async function basicWeatherToolCalling() {
  const result = await generateText({
    model: OPENAI_MODEL_NAME,
    tools: {
      weather: tool({
        description: "Get the weather in a location",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        /**
         * This is an optional async function called with the inputs the model generates from the tool call.
         */
        execute: async ({ location }) => ({
          location,
          temperature: 50 + Math.floor(Math.random() * 21) - 10,
        }),
      }),
    },
    prompt: `What is the weather in New York City?`,
  });

  for (const toolCall of result.toolCalls) {
    console.log("Tool Call:", toolCall);
  }

  for (const toolResult of result.toolResults) {
    console.log("Tool Result:", toolResult);
  }

  return result;
}

export async function multipleToolCalls() {
  const result = await generateText({
    model: OPENAI_MODEL_NAME,
    tools: {
      weather: tool({
        description: "Get the weather in a location",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        /**
         * This is an optional async function called with the inputs the model generates from the tool call.
         */
        execute: async ({ location }) => ({
          location,
          temperature: 50 + Math.floor(Math.random() * 21) - 10, //random number
        }),
      }),
      cityAttractions: tool({
        description: "Get the tourist attractions",
        inputSchema: z
          .object({ city: z.string() })
          .describe("attractions in the city"),
        execute: async ({ city }) => ({
          city,
          attractions: ["Statue of Liberty", "Central Park", "Met Museum"],
        }),
      }),
    },
    prompt:
      "What is the weather in New York and what are the best attractions to visit?",
  });

  //input params passed into the execute function
  for (const toolCall of result.toolCalls) {
    console.log(toolCall);
  }

  // generated output from the function call
  for (const toolResults of result.toolResults) {
    console.log(toolResults);
  }

  return result;
}

/**
 * By default tool calls only return results returned by the execute function.
 * In order to instruct the model to summarize the tool results,
 * use the `stopWhen` property to tell the model to auto-loop.
 * After tools run, send their results back into the model for another turn so it can use them and produce text.
 * `stepCountIs(n)` puts a hard ceiling on how many model turns you trigger.
 */
export async function generateResponseFromToolCalls() {
  const NUMBER_OF_STEPS = 3;
  const weather = tool({
    description: "Get the weather in a location",
    inputSchema: z.object({ location: z.string() }),
    execute: async ({ location }) => ({ location, temperature: 72 }),
  });

  const cityAttractions = tool({
    description: "Get attractions for a city",
    inputSchema: z.object({ city: z.string() }),
    execute: async ({ city }) => ({
      city,
      attractions: ["Central Park", "Met Museum"],
    }),
  });

  const result = await generateText({
    model: OPENAI_MODEL_NAME,
    tools: { weather, cityAttractions },
    stopWhen: stepCountIs(NUMBER_OF_STEPS), //  1) tools; 2) model summarizes
    prompt:
      "What is the weather in New York and what are the best attractions to visit?",
  });

  // extract all tool calls from the steps:
  const allToolCalls = result.steps.flatMap((step) => step.toolCalls);

  console.log(allToolCalls);

  console.log("\n\n");

  // generated output from the function call
  for (const toolResults of result.toolResults) {
    console.log(`Tool results: ${toolResults}`);
  }

  console.log(`Generated results: ${result.text}`);
}

/**
 * Exercise: Tool Calling with Vercel AI SDK
 * 
 * Goals:
   1) Implement a single tool ("priceLookup") to get a grocery item's price.
   2) Implement two tools ("priceLookup" + "deliveryEta") and let the model call both.
   3) Use stopWhen(stepCountIs(...)) to let the model auto-loop and summarize tool results.

   Tips:
   - The "execute" function returns JSON that gets fed back to the model.
   - Use small, predictable data so you can verify behavior quickly.
   - Run one exercise at a time by uncommenting a call in main().
 */

// Simple in-memory data (pretend these came from a DB):
const PRICE_TABLE = {
  milk: 1.59,
  bread: 2.49,
  eggs: 3.29,
  apple: 0.89,
  banana: 0.59,
};

async function singleToolCalling() {
  const priceLookUp = tool({
    description: "Return the price in AUD for a grocery item",
    inputSchema: z.object({
      item: z.string().describe("The grocery item to look up the price for"),
    }),
    execute: async ({ item }) => ({
      item,
      price: PRICE_TABLE[item.toLowerCase()] || null,
    }),
  });

  const result = await generateText({
    model: OPENAI_MODEL_NAME,
    tools: { priceLookUp },
    prompt: "What is the price of milk?",
  });

  console.log("Tool Calls:", result.toolCalls);
  console.log("Tool Results:", result.toolResults);
  console.log("Generated Text:", result.text);

  return result;
}

// -----------------------------------------------------
// 2) MULTIPLE TOOL CALLS
// -----------------------------------------------------
/*
  Challenge:
  Add a second tool "deliveryEta" that takes { address: string }
  and returns a pretend ETA in minutes (e.g., between 20–40).

  Steps:
    A) Reuse priceLookup from above (copy it here if helpful).
    B) Add deliveryEta tool.
    C) Ask: "How much do milk and bread cost, and how long to deliver to 221B Baker Street?"
    D) Log toolCalls and toolResults to verify both are used.
*/
async function multipleToolCalling() {
  const priceLookup = tool({
    description: "Return the price in USD for a grocery item.",
    inputSchema: z.object({ item: z.string() }),
    execute: async ({ item }) => ({
      item,
      price: PRICE_TABLE[item.toLowerCase()] ?? null,
    }),
  });

  const deliveryEta = tool({
    description:
      "Return the estimated delivery time in minutes for a given address.",
    inputSchema: z.object({
      address: z.string().describe("The delivery address to estimate time for"),
    }),
    execute: async ({ address }) => ({
      address,
      eta: 20 + Math.floor(Math.random() * 21), // Random ETA between 20-40 minutes
    }),
  });

  const result = await generateText({
    model: OPENAI_MODEL_NAME,
    tools: { priceLookup, deliveryEta },
    prompt:
      "How much do milk and bread cost, and how long to deliver to 221B Baker Street?",
  });

  console.log("Tool Calls:", result.toolCalls);
  console.log("Tool Results:", result.toolResults);
  console.log("Generated Text:", result.text);

  return result;
}

// -----------------------------------------------------
// 3) AUTO-LOOP + SUMMARY WITH stopWhen
// -----------------------------------------------------
/*
  Challenge:
  Let the model call tools, receive results, and THEN summarize them in a second turn
  (without you manually looping). Use stopWhen(stepCountIs(NUM_STEPS)).

  Tools:
    - priceLookup({ item: string }) -> { item, price }
    - deliveryEta({ address: string }) -> { address, etaMinutes }

  Prompt:
    "I want to buy eggs and a banana. Use tools to check prices and tell me the
     total cost, then estimate delivery time to 221B Baker Street."

  Steps:
    A) Define both tools (can reuse).
    B) Call generateText with tools + stopWhen(stepCountIs(3)).
       Turn 1: model plans tool calls
       Turn 2: tools execute; results fed back
       Turn 3: model summarizes with a friendly final answer
    C) Print all intermediate steps and final summary.
*/

export async function summarizeWithStopWhenExercise() {
  const NUMBER_OF_STEPS = 3;

  // TODO A: Define tools
  const priceLookup = tool({
    description: "Return the price in USD for a grocery item.",
    inputSchema: z.object({ item: z.string() }),
    execute: async ({ item }) => ({
      item,
      price: PRICE_TABLE[item.toLowerCase()] ?? null,
    }),
  });

  const deliveryEta = tool({
    description: "Estimate delivery time in minutes to a given address.",
    inputSchema: z.object({ address: z.string() }),
    execute: async ({ address }) => {
      const eta = 20 + Math.floor(Math.random() * 21);
      return { address, etaMinutes: eta };
    },
  });

  // TODO B: Enable auto-loop summarization
  const result = await generateText({
    model: OPENAI_MODEL_NAME,
    tools: { priceLookup, deliveryEta },
    stopWhen: stepCountIs(NUMBER_OF_STEPS),
    prompt:
      "I want to buy eggs and a banana. Use tools to check prices and tell me the total cost, then estimate delivery time to 221B Baker Street.",
  });

  // TODO C: Inspect all steps & final
  console.log("--- ALL STEPS (auto-loop) ---");
  console.log(
    result.steps.map((s, i) => ({
      step: i + 1,
      type: s.type,
      toolCalls: s.toolCalls,
      toolResults: s.toolResults,
      text: s.text,
    })),
  );

  console.log("\n--- Final Summary ---");
  console.log(result.text);
}
