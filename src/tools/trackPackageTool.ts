import z from "zod";
import { server } from "../index.js";
// define a schema for the weather data
const weatherSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  trackingNumber: z.string().describe("Package tracking number").optional(),
});

// define a tool
export const weatherTool = server.registerTool(
  // Name of the tool
  "trackPackage",
  {
    // Short description of what this tool does
    description: "Track delivery status using tracking number",
    //  Define the input schema using Zod
    inputSchema: weatherSchema,
  },
  // Define the async function that will run when the tool is called
  async ({ trackingNumber }) => {
    // You could connect to a real API here, but for now we're just simulating it
    return {
      content: [
        {
          type: "text",
          text: `Checking delivery status for: ${trackingNumber}`,
        },
      ],
    };
  },
);
