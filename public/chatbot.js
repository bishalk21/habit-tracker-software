const form = document.querySelector(".chatbot form");
const input = form.querySelector("input");
const responseElement = document.getElementById("response");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const userInput = input.value.trim();
  main(userInput);
  input.value = ""; // Clear the input field after submission
});

async function main(input) {
  try {
    responseElement.textContent = "Processing your request...";
    const response = await fetch(
      `http://localhost:3001/api/langchain/lc-chat-response?query=${encodeURIComponent(input)}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Response from server:", data);
    responseElement.textContent = data.data;
  } catch (error) {
    console.error("Error fetching response:", error);
    responseElement.textContent =
      "An error occurred while processing your request.";
  }
}
