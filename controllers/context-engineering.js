import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
// import { marked } from "marked";
// import DOMPurify from "dompurify";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
const openRouterModel = openRouter(process.env.OPENROUTER_MODEL_ID);

export async function createStream(req, res) {
  const { query, persona } = req.query;
  //   const query = "in 100 words, hel me learn AI context engineering.";
  console.log(persona, query);
  const messages = [
    {
      role: "user",
      content: query,
    },
  ];
  try {
    const systemPrompt = {
      assistant: `You are a helpful assistant that asks great follow up questions instead of assuming the user's full intent. Skip the introduction and get straight to the point.`,
      eli5: `You are a helpful teacher who explains concepts in a simple and short manner, as if explaining to a curious and intelligent 5 year old.`,
      coach: `You are a tough love coach that encourages people to be the best version of themselves. You give people realistic action plans and don't accept excuses.`,
    };
    // send conversation history to the model and get a streaming response
    const stream = await streamText({
      model: openRouterModel,
      system: systemPrompt[persona],
      messages: messages,
    });

    for await (const chunk of stream.textStream) {
      res.write(JSON.stringify({ role: "assistant", content: chunk }));
    }
    res.end();
  } catch (error) {
    console.error("Error in createStream:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
}
