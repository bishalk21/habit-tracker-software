// // context engineering chat
// import { marked } from "marked";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.4.12/+esm";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import initialMessages from "./conversation.js";
import { encode } from "https://cdn.jsdelivr.net/npm/gpt-tokenizer/+esm";

export class ChatView {
  constructor(chatContainer, messagesContainer) {
    this.chatContainer = chatContainer;
    this.messagesContainer = messagesContainer;
    this.messageCount = 0;
    this.maxMessages = 20; // Set the maximum number of messages to display

    // Get counter elements from the chat container
    this.totalTokensCounter = chatContainer.querySelector(
      "#total-tokens-counter",
    );
    this.contextTokensCounter = chatContainer.querySelector(
      "#context-tokens-counter",
    ); // Get summary card elements
    this.summaryCard = chatContainer.querySelector("#summary-card");
    this.summaryHeader = chatContainer.querySelector("#summary-header");
    this.summaryContent = chatContainer.querySelector("#summary-content");
    this.summaryToggle = chatContainer.querySelector("#summary-toggle");

    // Set up summary card toggle
    if (this.summaryHeader) {
      this.summaryHeader.addEventListener("click", () => this.toggleSummary());
    }
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

  updateLatestMessage(message) {
    const lastMessageElm = this.messagesContainer.lastElementChild;
    if (lastMessageElm) {
      const contentDiv = lastMessageElm.querySelector(".message-content");
      if (contentDiv) {
        contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(message));
      } else {
        lastMessageElm.innerHTML = DOMPurify.sanitize(marked.parse(message));
      }
    }
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

  // Add a method to update the message counters
  updateCounters(allMessages, contextMessages = null) {
    const totalTokens = calculateTokens(allMessages);
    const contextTokens = contextMessages
      ? calculateTokens(contextMessages)
      : totalTokens;

    this.totalTokensCounter.textContent = `${totalTokens} total tokens`;
    this.contextTokensCounter.textContent = `${contextTokens} context tokens`;
  }

  addSummarizingIndicator() {
    const indicatorElement = document.createElement("div");
    indicatorElement.className = "message system";
    indicatorElement.id = "summarizing-indicator";

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.innerHTML = `
      <div class="loading-indicator">
        <span>Summarizing conversation</span>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;

    indicatorElement.appendChild(contentDiv);
    this.messagesContainer.appendChild(indicatorElement);
    this.scrollToBottom();
  }

  removeSummarizingIndicator() {
    const indicator = document.getElementById("summarizing-indicator");
    if (indicator) {
      indicator.remove();
    }
  }

  showSummary(summaryContent) {
    if (!this.summaryCard) return;

    // Show the card
    this.summaryCard.classList.remove("hidden");

    // Update content with proper markdown rendering
    this.summaryContent.innerHTML = DOMPurify.sanitize(
      marked.parse(summaryContent),
    );

    // Start collapsed - let user click to expand
    this.summaryContent.classList.add("collapsed");
    this.summaryToggle.textContent = "▼";
  }

  toggleSummary() {
    if (!this.summaryContent) return;

    const isCollapsed = this.summaryContent.classList.contains("collapsed");

    if (isCollapsed) {
      this.summaryContent.classList.remove("collapsed");
      this.summaryToggle.textContent = "▲";
    } else {
      this.summaryContent.classList.add("collapsed");
      this.summaryToggle.textContent = "▼";
    }
  }
}

export function calculateTokens(messages) {
  // Combine all message content
  const allContent = messages.map((m) => m.content).join();

  // Use gpt-tokenizer to get token count
  const tokens = encode(allContent);
  return tokens.length;
}

const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-button");
const messagesContainer = document.getElementById("messages-container");
const chatContainer = document.getElementById("chat-container");
const personaSelector = document.getElementById("persona-selector");

const chatView = new ChatView(chatContainer, messagesContainer);
const messages = initialMessages.slice(-2);
messages.forEach((message) => {
  chatView.addMessage(message);
});

chatView.updateCounters(initialMessages, messages);

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

function disableInputWhileLoading(shouldDisable) {
  messageInput.disabled = shouldDisable;
  sendBtn.disabled = shouldDisable;
}

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
    disableInputWhileLoading(true);
    chatView.addSummarizingIndicator();

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
    messages.push(assistantMessage);
    const messageElm = chatView.addMessage(assistantMessage);
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop(); // incomplete JSON stays here

      for (const line of lines) {
        if (!line.trim()) continue;

        const parsed = JSON.parse(line);
        assistantMessage.content += parsed.content;
      }

      chatView.updateLatestMessage(assistantMessage.content);
      chatView.scrollToBottom();
    }
  } catch (error) {
    console.error("Error in handleFormSubmit:", error);
  } finally {
    disableInputWhileLoading(false);
    chatView.updateCounters(initialMessages, messages);
  }
}
