// // context engineering chat
// import { marked } from "marked";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.4.12/+esm";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export class ChatView {
  constructor(chatContainer, messagesContainer) {
    this.chatContainer = chatContainer;
    this.messagesContainer = messagesContainer;
    this.messageCount = 0;
    this.maxMessages = 30; // Set the maximum number of messages to display
  }
  // Add a method to add messages to the chat
  addMessage(message) {
    const messageElm = this.createMessageElem(message);
    this.messagesContainer.appendChild(messageElm);
    this.messageCount++;
    this.trimOldMessages(); // Trim old messages if necessary
    this.scrollToBottom(); // Scroll to the bottom after adding a new message
    return messageElm; // Return the newly created message element
  }

  // Add a method to create a message element
  createMessageElem(message) {
    const messageElm = document.createElement("div");
    messageElm.className = `message ${message.role}`;
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    if (message.role === "assistant" && !message.content) {
      contentDiv.innerHTML = `
        <div class="loading-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        </div>
        `;
    } else {
      contentDiv.innerHTML = message.content;
    }
    messageElm.appendChild(contentDiv);
    return messageElm;
  }

  // Add a method to trim old messages if the count exceeds maxMessages
  trimOldMessages() {
    while (this.messagesContainer.children.length > this.maxMessages) {
      this.messagesContainer.removeChild(this.messagesContainer.firstChild);
      this.messageCount--;
    }
  }

  // Add a method to scroll to the bottom of the chat container
  scrollToBottom() {
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }
}

const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-button");
const messagesContainer = document.getElementById("messages-container");
const chatContainer = document.getElementById("chat-container");
const personaSelector = document.getElementById("persona-selector");

const chatView = new ChatView(chatContainer, messagesContainer);

const personas = [
  {
    value: "assistant",
    label: "Assistant",
  },
  {
    label: "ELI5",
    value: "eli5",
  },
  {
    label: "Coach",
    value: "coach",
  },
];

personas.forEach((persona) => {
  const option = document.createElement("option");
  option.value = persona.value;
  option.textContent = persona.label;
  personaSelector.appendChild(option);
});

chatForm.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  console.log("Form submitted. Processing user input...");

  event.preventDefault();
  try {
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;
    chatView.addMessage({ role: "user", content: userMessage });
    messageInput.value = "";
    sendBtn.disabled = true;

    const response = await fetch(
      `http://localhost:3001/api/context-engineering/create-stream?query=${encodeURIComponent(userMessage)}&persona=${encodeURIComponent(personaSelector.value)}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // console.log("Streaming response received. Processing chunks...", response);

    const reader = response.body.getReader();
    console.log("Reader created. Starting to read stream...", reader);
    const decoder = new TextDecoder("utf-8");
    let assistantMessage = { role: "assistant", content: "" };
    const messageElm = chatView.addMessage(assistantMessage);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      console.log("Received chunk:", chunk);
      const parsedChunk = JSON.parse(chunk);
      assistantMessage.content += parsedChunk.content;
      messageElm.querySelector(".message-content").innerHTML =
        DOMPurify.sanitize(marked.parse(assistantMessage.content));
      chatView.scrollToBottom();
    }
  } catch (error) {
    console.error("Error in handleFormSubmit:", error);
  } finally {
    sendBtn.disabled = false;
  }
}
