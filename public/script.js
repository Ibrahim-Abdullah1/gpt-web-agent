const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const loading = document.getElementById("loading");

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
  loading.classList.remove("hidden");

  // Send message to backend
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    loading.classList.add("hidden");
    if (data.reply) {
      appendMessage(data.reply, "assistant");
    } else {
      appendMessage("Error: Could not get response", "assistant");
    }
  } catch (error) {
    loading.classList.add("hidden");
    appendMessage("Error: Server not responding", "assistant");
  }
}

function appendMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message p-3 rounded-lg max-w-[80%] ${
    sender === "user" 
      ? "bg-blue-100 ml-auto text-right" 
      : "bg-gray-200 mr-auto"
  }`;

  // Enhanced markdown formatting
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/`(.*?)`/g, "<code>$1</code>") // Inline code
    .replace(/\n/g, "<br>") // Line breaks
    .replace(/(https?:\/\/[^\s<]+)(?![^<]*>)/g, '<a href="$1" target="_blank" class="text-blue-600 hover:underline">$1</a>') // URLs
    .replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>") // Unordered lists
    .replace(/(<li>.*<\/li>)/g, "<ul class='markdown-body'>$1</ul>"); // Wrap lists

  // Handle code blocks
  formattedText = formattedText.replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>");

  messageDiv.innerHTML = `<div class="markdown-body">${formattedText}</div>`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}