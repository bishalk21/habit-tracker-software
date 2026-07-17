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

// Semantic search function
export async function semanticSearch(req, res) {
  try {
    // const query = "Jammin' in the Big Easy";
    const query = "Decoding Orca Calls";
    if (!query) {
      return res.status(400).json({ error: "Missing 'query' parameter" });
    }
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    //  query supabase for the nearest neighbors based on the embedding
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 1,
    });
    if (error) {
      console.error("Error performing semantic search:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to perform semantic search",
      });
    }
    return data.length === 0
      ? res.status(404).json({
          status: "error",
          message: "No matching documents found",
        })
      : res.status(200).json({
          status: "success",
          data: data,
        });
  } catch (error) {
    console.error("Error in semantic search:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to perform semantic search",
    });
  }
}

//  conversational response using openai chat completion
export async function generateChatResponse(req, res) {
  try {
    // const query = "Something peaceful and relaxing to listen to";
    const query = "An Episode Elon Musk would enjoy";
    const embedding = await createEmbedding(query);
    const match = await findNearestMatch(embedding);
    const chatResponse = await getChatCompletion(match, query);
    res.status(200).json({
      status: "success",
      data: chatResponse,
    });
  } catch (error) {
    console.error("Error generating chat response:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate chat response",
    });
  }
}

// Create an embedding vector representing the input text
async function createEmbedding(input) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });
  return embeddingResponse.data[0].embedding;
}

// Query Supabase and return a semantically matching text chunk
async function findNearestMatch(embedding) {
  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 1,
  });
  return data[0].content;
}

async function getChatCompletion(text, query) {
  try {
    const chatMessages = [
      {
        role: "system",
        content: `You are an enthusiastic podcast expert who loves recommending podcasts to people. You will be given two pieces of information - some context about podcasts episodes and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
      },
      {
        role: "user",
        content: `Context: ${text}\n\nQuestion: ${query}`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0.7,
      frequency_penalty: 0.5,
    });
    return response.choices[0].message;
  } catch (error) {
    console.error("Error generating chat completion:", error);
    throw new Error("Failed to generate chat completion");
  }
}
