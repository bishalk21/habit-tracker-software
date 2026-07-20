/**
 * Goal - build an agent that can get the current weather at my current location
 * and give me some localized ideas of activities I can do.
 */
import { openai } from "../utils/ai-openai.js";

async function getCurrentWeather() {
  const weather = {
    temperature: "72",
    unit: "F",
    forecast: "Sunny",
  };
  return JSON.stringify(weather);
}

async function getLocation() {
  const location = {
    city: "Sydney",
    country: "Australia",
  };
  return JSON.stringify(location);
}

export async function getWeatherAndActivitySuggestions(req, res) {
  try {
    const location = await getLocation();
    const weather = await getCurrentWeather();
    const weatherResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content:
            "Give me the list of activities I can do based on my current location and weather. Here is the location: " +
            location +
            " and here is the weather: " +
            weather,
        },
      ],
    });
    const activitySuggestions =
      weatherResponse.choices[0].message.content.trim();
    res.status(200).json({
      status: "success",
      data: activitySuggestions,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}
