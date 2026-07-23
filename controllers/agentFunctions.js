import { getCurrentWeather, getLocation } from "../agent/agent.js";
import { openai } from "../utils/ai-openai.js";

/**
 * Challenge: Set up the function
 * 1. Create a function called `agent` that takes a `query` as a parameter
 * 2. Create a messages array that follows the pattern openai expects for
 *    its chat completions endpoint. The first message should be the system
 *    prompt we wrote above, and the second message should be the query
 *    from the user found in the `agent` function parameter.
 * 3. Move the code below inside the function (and uncomment it)
 * 4. Call the function with a string query of any kind and see what gets returned.
 */

const systemPrompt = `
You cycle through Thought, Action, PAUSE, Observation. At the end of the loop you output a final Answer. Your final answer should be highly specific to the observations you have from running
the actions.
1. Thought: Describe your thoughts about the question you have been asked.
2. Action: run one of the actions available to you - then return PAUSE.
3. PAUSE
4. Observation: will be the result of running those actions.

Available actions:
- getCurrentWeather: 
    E.g. getCurrentWeather: Salt Lake City
    Returns the current weather of the location specified.
- getLocation:
    E.g. getLocation: null
    Returns user's location details. No arguments needed.

Example session:
Question: Please give me some ideas for activities to do this afternoon.
Thought: I should look up the user's location so I can give location-specific activity ideas.
Action: getLocation: null
PAUSE

You will be called again with something like this:
Observation: "New York City, NY"

Then you loop again:
Thought: To get even more specific activity ideas, I should get the current weather at the user's location.
Action: getCurrentWeather: New York City
PAUSE

You'll then be called again with something like this:
Observation: { location: "New York City, NY", forecast: ["sunny"] }

You then output:
Answer: <Suggested activities based on sunny weather that are highly specific to New York City and surrounding areas.>
`;

const availableActions = {
  getCurrentWeather: getCurrentWeather,
  getLocation: getLocation,
};

export async function getWeatherAndActivitySuggestions(req, res) {
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content:
        "What are some activity ideas that I can do this afternoon based on my location and weather?",
      // "Give me the list of activities I can do based on my current location and weather. Here is the location: " +
      // location +
      // " and here is the weather: " +
      // weather,
    },
  ];

  const iterationLimit = 5; // Limit the number of Thought-Action-Observation cycles
  const actionRegex = /^Action:\s*(\w+):?\s*(.*)/;

  try {
    for (let i = 0; i < iterationLimit; i++) {
      console.log(
        `Iteration ${i + 1}: Sending messages to OpenAI for processing...`,
      );
      const weatherResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
      });
      const responseText = weatherResponse.choices[0].message.content;
      messages.push({
        role: "assistant",
        content: `${responseText}`,
      });

      console.log(responseText);
      /**
       * PLAN:
     * 1. Split the string on the newline character \n
     * 2. Search through the array of strings for one that has "Action:"
     *      - REGEX to use: /^Action: (\w+): (.*)$/
     *        const actionRegex = /Action:\s*(\w+):?\s*(.*)/;  
              s* matches any whitespace characters (including none), 
              (\w+) captures the function name, and (.*) captures the parameter (if any).
     *      - This will give you the function name and the parameter (if any)
     * 3. Parse the action (function and parameter) from the string
     * 4. Calling the function
     * 5. Add an "Observation" message with the results of the function call
     */

      const responseLines = responseText.split("\n");
      const actionLine = responseLines.find((line) => actionRegex.test(line));
      // const actions = actionRegex.exec(actionLine); // exec returns an array where the first element is the full match, the second is the function name, and the third is the parameter (if any)
      // const actions = actionLine.match(actionRegex); // match returns an array where the first element is the full match, the second is the function name, and the third is the parameter (if any)

      if (actionLine) {
        const actions = actionRegex["exec"](actionLine);
        const [_, actionName, actionParam] = actions;
        if (!availableActions.hasOwnProperty(actionName)) {
          throw new Error(`Action ${actionName} is not available.`);
        }
        console.log(
          `Executing action: ${actionName} with parameter: ${actionParam}`,
        );
        const observations = await availableActions[actionName](actionParam);
        messages.push({
          role: "assistant",
          content: `Observation: ${observations}`,
        });
        console.log("Observation:", observations);
      } else {
        console.log(
          "agent has finished processing. Final response:",
          responseText,
        );
        res.status(200).json({
          status: "success",
          data: responseText,
        });
        return; // Exit the loop and function after final response
      }
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}
