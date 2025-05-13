// server.js
// ----------------------------------------
const express = require("express");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(express.json());

// ---- Optional: serve static frontend from ./public ----
app.use(express.static(path.join(__dirname, "public")));

// Fallback root route (so visiting http://localhost:3000/ works even
// if you don’t have an index.html in /public)
app.get("/", (req, res) => {
  res.send(
    `<h2>Chat‑GPT Web Search Demo</h2>
     <p>POST a JSON body { "message": "..." } to <code>/chat</code> to talk.</p>`
  );
});

// ---- OpenAI setup ----
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---- POST /chat ----
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: message,
      tools: [
        {
          type: "web_search_preview",
          search_context_size: "medium",
          user_location: {
            type: "approximate",
            country: "PK",
          },
        },
      ],
      tool_choice: { type: "web_search_preview" }, // force one search
    });

    res.json({ reply: response.output_text });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ---- Start server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
