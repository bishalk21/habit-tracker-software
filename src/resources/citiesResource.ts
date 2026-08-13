/**
 *  Challenge: Create a static resource for the weather tool
 * - Use URI: weather://cities
 * - Return a plain text list of supported cities (e.g., London and New York)
 * - Set content type to 'text/plain'
 */

import { server } from "../index.js";

const supportedCities = ["London", "New York"];
export const citiesResource = server.registerResource(
  "citiesResource", // Unique resource name identifier
  "weather://cities", // Unique URI matching standard resource patterns
  {
    // Short description of the resource
    description: "List of supported cities for weather data",
  },
  // Define the async function that will run when the resource is accessed
  async () => {
    // Return the list of supported cities as plain text
    return {
      // Define the contents of the resource
      contents: [
        {
          uri: "weather://cities",
          mimeType: "text/plain",
          text: `Supported Cities:\n${supportedCities.join("\n")}`,
        },
      ],
    };
  },
);
