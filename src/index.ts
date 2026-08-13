import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// create MCP server instance
export const server = new McpServer({
  name: "weather-mcp-server",
  version: "1.0.0",
});

//  a helper function to simulate fetching weather data
export async function getWeatherCity(city: string) {
  if (city.toLowerCase() === "Sydney") {
    return {
      temp: "22°C",
      forecast: "Partly cloudy with a breeze",
    };
  }
  if (city.toLowerCase() === "Melbourne") {
    return {
      temp: "28°C",
      forecast: "Sunny with clear skies",
    };
  }
  return {
    temp: "Unknown",
    forecast: "Weather information not available",
  };
}

// to run the server, we connect it to a transport.
// using STDIO (standard input/output) transport, great for local dev & CLI testing

// 🌟 Challenge:
// Inside the async function:
// 1. Define the stdio transport by creating a `const transport` object with a new instance of `StdioServerTransport`.
// 2. Connect the server using `await server.connect(transport)`.
// 3. Print status messages to the terminal using `console.error()` to indicate the server is running.
async function init() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🌤️  Weather MCP Server Started!");
  console.error("🛠️  Tool: getWeatherDataByCityName");
  console.error("📚 Resource: weather://cities");
  console.error("🏙️  Supported Cities: New York, London");
  console.error("✅ Server ready!");
}

init().catch((error) => {
  console.error("Error initializing the server:", error);
});
