import { getCurrentWeather, getLocation } from "../agent/agent.js";

export const tools = [
  {
    type: "function",
    function: {
      name: "getLocation",
      description: "Get the user's location details. No parameters needed.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCurrentWeather",
      description: "Get the current weather of a specified location.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The location for which to get the current weather.",
          },
        },
        required: ["location"],
      },
    },
  },
];

export const functions = [
  {
    function: getCurrentWeather,
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The location for which to get the current weather.",
        },
      },
      required: ["location"],
    },
  },
  {
    function: getLocation,
    parameters: {
      type: "object",
      properties: {},
    },
  },
];

export const availableActions = {
  getCurrentWeather: getCurrentWeather,
  getLocation: getLocation,
};

const httpOptions = {
  path: "/8.8.8.8/json/",
  host: "ipapi.co",
  port: 443,
  headers: { "User-Agent": "nodejs-ipapi-v1.02" },
};
