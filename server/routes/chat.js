const router = require("express").Router();
const Anthropic = require("@anthropic-ai/sdk");
const { VoyageAIClient } = require("voyageai");
const Receipt = require("../models/receipt");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    // Embed question
    const embeddingResponse = await voyageClient.embed({
      input: [question],
      model: "voyage-3-lite",
    });
    const questionVector = embeddingResponse.data[0].embedding;

    // Vector search
    const similarReceipts = await Receipt.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: questionVector,
          numCandidates: 20,
          limit: 5,
        },
      },
      {
        $project: { embedding: 0 },
      },
    ]);

    // Build context
    const context = similarReceipts
      .map(
        (r) =>
          `Merchant: ${r.merchant}, Date: ${r.date}, Items: ${r.items.map((i) => `${i.name} Rs.${i.price}`).join(", ")}, Total: Rs.${r.total}, Category: ${r.category}`,
      )
      .join("\n");

    // Set SSE headers — this tells browser "keep connection open, data is coming"
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream Claude response
    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a personal finance assistant. Answer based only on receipt data provided.

Receipt Data:
${context}

Question: ${question}`,
        },
      ],
    });

    // Send each chunk to client as it arrives
    stream.on("text", (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    // When done — send end signal
    stream.on("finalMessage", () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    // Handle errors
    stream.on("error", (error) => {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
