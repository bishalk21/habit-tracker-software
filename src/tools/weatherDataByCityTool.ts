// 🧠 Challenge:
// Create a tool called `getWeatherDataByCityName`
// It should take a city (New York or London) and return mock weather data as JSON text

import z from "zod";
import { getWeatherCity, server } from "../index.js";

// Use a helper like getWeatherByCity() to return the data
const cityWeatherSchema = z.object({
  city: z.string().describe("City name to get weather data for"),
});

const getWeatherDataByCityNameTool = server.registerTool(
  "getWeatherDataByCityName",
  {
    description: "Get weather data for a specific city",
    inputSchema: cityWeatherSchema,
  },
  async ({ city }) => {
    const weatherData = await getWeatherCity(city);
    return {
      content: [
        {
          type: "text",
          text: `Weather data for ${city}: ${JSON.stringify(weatherData)}`,
        },
      ],
    };
  },
);
