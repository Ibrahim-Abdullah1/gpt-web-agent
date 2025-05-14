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

  // Show loading message in chat box
  const loadingMessageDiv = appendLoadingMessage();
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
    // Remove loading message
    if (loadingMessageDiv) {
      loadingMessageDiv.remove();
    }
    if (data.reply) {
      appendMessage(data.reply, "assistant");
    } else {
      appendMessage("Error: Could not get response", "assistant");
    }
  } catch (error) {
    loading.classList.add("hidden");
    // Remove loading message
    if (loadingMessageDiv) {
      loadingMessageDiv.remove();
    }
    appendMessage("Error: Server not responding", "assistant");
  }
}

function appendMessage(text, sender) {
  const messageDiv = document.createElement("div");
  // Calculate width class based on text length
  const textLength = text.length;
  let widthClass = "w-fit";
  if (textLength > 100) {
    widthClass = "max-w-[80%]";
  } else if (textLength > 50) {
    widthClass = "max-w-[60%]";
  } else if (textLength > 20) {
    widthClass = "max-w-[40%]";
  } else {
    widthClass = "max-w-[20%]";
  }

  messageDiv.className = `message p-3 rounded-lg mb-3 ${widthClass} ${
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

function appendLoadingMessage() {
  const loadingMessageDiv = document.createElement("div");
  loadingMessageDiv.className = "message p-3 rounded-lg max-w-[80%] mb-3 bg-gray-200 mr-auto";
  loadingMessageDiv.innerHTML = `
    <div class="markdown-body flex items-center">
      <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Generating response...</span>
    </div>`;
  chatBox.appendChild(loadingMessageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
  return loadingMessageDiv;
}