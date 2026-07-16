import { openai } from "../utils/ai-openai.js";
// import { AutoTokenizer } from "@huggingface/transformers";
import podcasts from "../mocks/content.js";
import { supabase } from "../config/supabaseConfig.js";

export async function textEmbeddings(req, res) {
  try {
    // const tokenizer = await AutoTokenizer.from_pretrained("Xenova/text-embedding-ada-002");
    // const tokens = tokenizer.encode("Hello, world!");
    // console.log(`Number of tokens for "Hello, world!": ${tokens.length}`, tokens);

    /*
  Challenge: Pair text with its embedding
    - For each text input, create an object with 
      a 'content' and 'embedding' property
    - The value of 'content' should be the text
    - The value of 'embedding' should be the vector embedding for that text
*/

    const inputText = req.body.text || req.query.text;
    if (!inputText) {
      return res.status(400).json({ error: "Missing 'text' query parameter" });
    }
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: inputText,
    });
    res.status(200).json({
      status: "success",
      data: embedding.data[0].embedding,
    });
  } catch (error) {
    console.error("Error fetching embeddings:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch embeddings",
    });
  }
}

// pair text with its embedding
export async function pairTextWithEmbedding(req, res) {
  const content = [
    "Beyond Mars: speculating life on distant planets.",
    "Jazz under stars: a night in New Orleans' music scene.",
    "Mysteries of the deep: exploring uncharted ocean caves.",
    "Rediscovering lost melodies: the rebirth of vinyl culture.",
    "Tales from the tech frontier: decoding AI ethics.",
  ];
  try {
    const embeddingPromises = content.map(async (text) => {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text.toString(),
      });
      return {
        content: text,
        embedding: embeddingResponse.data[0].embedding,
      };
    });

    const embedding = await Promise.all(embeddingPromises);
    res.status(200).json({
      status: "success",
      data: embedding,
    });
  } catch (error) {
    console.error("Error fetching embeddings:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch embeddings",
    });
  }
}

export async function podcastsTextEmbeddings(req, res) {
  try {
    const data = await Promise.all(
      podcasts.map(async (text) => {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: text.toString(),
        });
        return {
          content: text,
          embedding: embeddingResponse.data[0].embedding,
        };
      }),
    );
    // const embedding = await Promise.all(embeddingPromises);

    // insert the embeddings into the database
    const { error } = await supabase.from("documents").insert(data);
    if (error) {
      console.error("Error inserting embeddings into the database:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to insert embeddings into the database",
      });
    }
    console.log("Embeddings inserted into the database successfully");

    res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error("Error fetching embeddings:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch embeddings",
    });
  }
}
