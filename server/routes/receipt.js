const router = require("express").Router();
const Anthropic = require("@anthropic-ai/sdk");
const Receipt = require("../models/receipt");
const { VoyageAIClient } = require("voyageai");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize VoyageAI client
const voyageClient = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,
});

router.post("/extract", async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Extract receipt data and return ONLY a raw JSON object. No markdown, no code blocks, no explanation. Just the JSON itself:
              {
                "merchant": "store name",
                "date": "YYYY-MM-DD",
                "items": [{"name": "item name", "price": 0.00}],
                "total": 0.00,
                "category": "Food/Transport/Shopping/Other"
              }`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].text;
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const json = JSON.parse(cleaned);

    // Build text for embedding
    const receiptText = `
      Merchant: ${json.merchant}
      Category: ${json.category}
      Items: ${json.items.map((i) => i.name).join(", ")}
      Total: ${json.total}
      Date: ${json.date}
    `;

    // Generate embedding
    const embeddingResponse = await voyageClient.embed({
      input: [receiptText],
      model: "voyage-3-lite",
    });

    // Save everything in one shot
    const receipt = new Receipt({
      ...json,
      embedding: embeddingResponse.data[0].embedding,
    });
    await receipt.save();

    res.json({ success: true, data: receipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });
    res.json({ success: true, data: receipts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
