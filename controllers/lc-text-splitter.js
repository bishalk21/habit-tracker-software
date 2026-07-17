import { CharacterTextSplitter } from "@langchain/textsplitters";
import { readFileSync } from "fs";

//langchain text splitter for splitting text into chunks
async function splitTextIntoChunks() {
  //   const response = await fetch("/mocks/podcasts.txt");
  //   const text = await response.text();
  const text = readFileSync("mocks/podcasts.txt", "utf-8");
  console.log("Text length:", text.length, text);
  const textSplitter = new CharacterTextSplitter({
    // separator: "\n\n", // Split on double newlines
    separator: " ",
    chunkSize: 150, // maximum number of characters in each chunk
    chunkOverlap: 15, // number of characters to overlap between chunks
  });
  const chunks = await textSplitter.createDocuments([text]);
  console.log("Number of chunks:", chunks.length, chunks);
}

splitTextIntoChunks();
