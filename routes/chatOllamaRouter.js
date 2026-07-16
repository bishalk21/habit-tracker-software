import ollama from "ollama";
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).json({
    status: "success",
    message:
      "Ollama API is working. Use the /chat endpoint with a query parameter.",
  });
});

router.get("/chat", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        status: "error",
        message:
          "Ask something via the 'q' query parameter, e.g., /api/ollama/chat?q=What is the capital of France?",
      });
    } else {
      const response = await ollama.chat({
        model: "mistral",
        messages: [{ role: "user", content: query }],
      });
      res.status(200).json({
        status: "success",
        message: "Ollama chat executed successfully",
        data: response.message.content,
      });
    }
  } catch (error) {
    console.error("Error in route:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request.",
    });
  }
});

export default router;
