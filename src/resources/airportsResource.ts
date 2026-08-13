import { server } from "../index.js";

// registering a static resource on the server
server.registerResource(
  // Unique resource name identifier
  "airportsResource",
  // Unique URI matching standard resource patterns
  "flights://airports",
  {
    description: "List of supported airport codes",
  },
  // Define the async function that will run when the resource is accessed
  async () => {
    return {
      contents: [
        {
          uri: "flights://airports",
          mimeType: "text/plain",
          text: `Supported Airports:
                  - JFK
                  - LAX
                  - ORD`,
        },
      ],
    };
  },
);
