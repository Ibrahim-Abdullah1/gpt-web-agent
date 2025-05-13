const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Display user message
  appendMessage(message, "user");
  userInput.value = "";

  // Send message to backend
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    if (data.reply) {
      appendMessage(data.reply, "assistant");
    } else {
      appendMessage("Error: Could not get response", "assistant");
    }
  } catch (error) {
    appendMessage("Error: Server not responding", "assistant");
  }
}

function appendMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  
  // Convert markdown-like text to HTML (basic handling for **bold** and URLs)
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>'); // URLs
  
  messageDiv.innerHTML = formattedText;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}