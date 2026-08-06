export function simpleTextSplitter(text, chunkSize, chunkOverlap) {
  const chunks = [];
  let startIndex = 0;
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex);
    chunks.push(chunk);
    startIndex += chunkSize - chunkOverlap;
    if (startIndex <= 0) startIndex = endIndex; // Ensure we move forward if chunkOverlap is larger than chunkSize
  }
  return chunks.filter((chunk) => chunk.trim().length > 0); // Filter out empty chunks
}
