import { openai } from "../utils/ai-openai.js";
import { availableActions, functions, tools } from "../utils/tools.js";

export async function openAIFunctionAgent(req, res) {
  const query = "What's the current weather in my current location?";

  //   const query = "How are you today?";
  const iterationLimit = 5; // Limit the number of Thought-Action-Observation cycles
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers.",
    },
    { role: "user", content: query },
  ];
  try {
    for (let i = 0; i < iterationLimit; i++) {
      console.log(
        `Iteration ${i + 1}: Sending messages to OpenAI for processing...`,
      );
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        tools: tools,
      });

      console.log(`Response: `, response.choices[0]);
      /**
       * if finish_reason: "stop" → produce the final answer
       * if finish_reason: "tool_calls" → parse the tool call and execute the corresponding function, then loop back to send the result as an observation to the model for further processing.
       * 1. Parse the tool call from the model's response
       * 2. Execute the corresponding function with the provided parameters
       */
      const { finish_reason: finishReason, message } = response.choices[0];
      const { tool_calls: toolCalls } = message;

      console.log(toolCalls);
      messages.push(message);
      if (finishReason === "stop") {
        const output = message.content.trim();
        console.log("Final output:", output);
        return res.status(200).json({
          status: "success",
          data: output,
        });
      } else if (finishReason === "tool_calls") {
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const functionToCall = availableActions[functionName];
          const functionArgs = JSON.parse(toolCall.function.arguments);
          //   console.log(functionArgs);
          const fnResponse = await functionToCall(functionArgs);
          console.log(
            `Function ${functionName} executed. Response:`,
            fnResponse,
          );
          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: fnResponse,
            name: functionName,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
}
const messages = [
  {
    role: "system",
    content: `You are a helpful AI agent. Transform technical data into engaging, 
conversational responses, but only include the normal information a 
regular person might want unless they explicitly ask for more. Provide 
highly specific answers based on the information you're given. Prefer 
to gather information with the tools provided to you rather than 
giving basic, generic answers.`,
  },
];
// openai automatic function calling (auto-FC) agent
export async function autoFunctionCallingAgent(req, res) {
  const { query } = req.query;
  try {
    messages.push({
      role: "user",
      content: query,
    });
    const runner = await openai.beta.chat.completions
      .runFunctions({
        model: "gpt-4o-mini",
        messages: messages,
        functions: functions,
      })
      .on("message", (message) => {
        console.log("Received message:", message);
      });
    const finalContent = await runner.finalContent();
    messages.push({
      role: "system",
      content: `${finalContent}`,
    });
    return res.status(200).json({
      status: "success",
      data: finalContent,
    });
  } catch (error) {
    console.error("Error in autoFunctionCallingAgent:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
}
