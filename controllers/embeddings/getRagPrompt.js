export function getRagPrompt(contextStr, query) {
  return `You are a helpful assistant. Answer the user's question based ONLY on the provided context. If the context doesn't contain the answer, state politely "I'm sorry, I don't have specific information about that in the knowledge base.". Do not make up answers.

Context:
---
${contextStr}
---

Question: ${query}
Answer:`;
}

export function combineDocuments(docs) {
  return docs.map((doc) => doc.content).join("\n\n---\n\n");
}
