# ReceiptIQ — AI-Powered Expense Tracker

> Upload receipts. Ask questions. Get answers.

**Live Demo:** https://receiptiq-app.vercel.app

---

## What It Does

ReceiptIQ lets you upload receipt images and ask plain English questions about your spending — powered by a full RAG (Retrieval Augmented Generation) pipeline.

- Upload a receipt photo → Claude Vision API extracts structured data instantly
- Every receipt is embedded as a vector and stored in MongoDB Atlas
- Ask "how much did I spend on food this month?" → semantic search finds relevant receipts → Claude answers in real time with streaming

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js Frontend                     │
│         TanStack Query · Zustand · Tailwind CSS          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼──────────────────────────────────┐
│                   Express.js Backend                     │
│                    Node.js · REST API                    │
└────────┬─────────────────────────────┬───────────────────┘
         │                             │
┌────────▼────────┐          ┌─────────▼────────┐
│   Claude API    │          │   Voyage AI       │
│  Vision · Chat  │          │   Embeddings      │
│  Streaming      │          │   512 dimensions  │
└─────────────────┘          └─────────┬─────────┘
                                       │
                             ┌─────────▼─────────┐
                             │   MongoDB Atlas    │
                             │  Vector Search     │
                             │  receiptiq cluster │
                             └───────────────────┘
```

---

## RAG Pipeline

```
Receipt Image
     │
     ▼
Claude Vision API → Structured JSON
     │               { merchant, date, items, total, category }
     ▼
Voyage AI Embed → 512-dimension vector
     │
     ▼
MongoDB Atlas → Store document + vector

─── At query time ───

User Question
     │
     ▼
Voyage AI Embed → question vector
     │
     ▼
MongoDB $vectorSearch → top 5 similar receipts
     │
     ▼
Claude API → answer streamed via SSE
     │
     ▼
Frontend → word-by-word streaming UI
```

---

## Tech Stack

| Layer           | Technology                  | Why                                    |
| --------------- | --------------------------- | -------------------------------------- |
| Frontend        | Next.js 14 + TypeScript     | App Router, file-based routing         |
| Styling         | Tailwind CSS + Shadcn/ui    | Utility-first, owns component code     |
| State           | Zustand                     | Simple global state                    |
| Data Fetching   | TanStack Query              | Caching, auto-refetch, invalidation    |
| Backend         | Node.js + Express           | Separate AI logic from frontend        |
| Database        | MongoDB Atlas               | Document store + vector search unified |
| AI — Vision     | Claude API (claude-sonnet)  | Best-in-class image understanding      |
| AI — Chat       | Claude API (streaming)      | SSE streaming for real-time responses  |
| Embeddings      | Voyage AI (voyage-3-lite)   | Anthropic-recommended, 512 dimensions  |
| Vector Search   | MongoDB Atlas Vector Search | No separate vector DB needed           |
| Frontend Deploy | Vercel                      | Zero-config Next.js deployment         |
| Backend Deploy  | Railway                     | Simple Node.js hosting                 |

---

## Features

- **Receipt Extraction** — Upload any receipt image, Claude Vision API returns structured JSON (merchant, date, items, total, category)
- **Vector Embeddings** — Every receipt is embedded using Voyage AI and stored alongside the document in MongoDB
- **Semantic Search** — Ask questions in plain English, MongoDB Atlas Vector Search finds relevant receipts by meaning not keywords
- **Streaming Chat** — Answers stream word-by-word via Server-Sent Events (SSE), just like ChatGPT
- **Real-time UI** — TanStack Query invalidates cache after upload, receipt list updates automatically

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB Atlas account
- Anthropic API key
- Voyage AI API key

### Clone & Install

```bash
git clone https://github.com/Prathamesh5976/receiptiq
cd receiptiq

# Install server dependencies
cd server
pnpm install

# Install client dependencies
cd ../client
pnpm install
```

### Environment Variables

**server/.env**

```
ANTHROPIC_API_KEY=your_key
VOYAGE_API_KEY=your_key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/receiptiq
PORT=5000
```

**client/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### MongoDB Atlas Setup

1. Create a free cluster on MongoDB Atlas
2. Create a Vector Search index on the `receipts` collection:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 512,
      "similarity": "cosine"
    }
  ]
}
```

### Run Locally

```bash
# Terminal 1 — Backend
cd server
pnpm dev

# Terminal 2 — Frontend
cd client
pnpm dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

---

## Project Structure

```
receiptiq/
├── client/                          # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # Landing page
│       │   └── (protected)/
│       │       ├── layout.tsx       # Sidebar layout
│       │       ├── dashboard/       # /dashboard
│       │       ├── receipts/        # /receipts — upload + list
│       │       └── chat/            # /chat — RAG chat interface
│       └── components/
│           ├── sidebar.tsx          # Navigation
│           ├── providers.tsx        # TanStack Query provider
│           └── ui/                  # Shadcn components
│
└── server/                          # Express backend
    ├── config/
    │   └── db.js                    # MongoDB connection
    ├── models/
    │   └── Receipt.js               # Mongoose schema
    ├── routes/
    │   ├── receipt.js               # POST /extract — Claude Vision + embed + save
    │   └── chat.js                  # POST /ask — vector search + Claude streaming
    └── index.js                     # Express app entry
```

---

## API Reference

### Extract Receipt

```
POST /api/receipts/extract
Body: { imageBase64: string, mediaType: string }
Returns: { success: true, data: Receipt }
```

### Get All Receipts

```
GET /api/receipts
Returns: { success: true, data: Receipt[] }
```

### Ask a Question

```
POST /api/chat/ask
Body: { question: string }
Returns: SSE stream — data: { text: string } | { done: true }
```

---

## Deployment

- **Frontend** → Vercel (root directory: `client`)
- **Backend** → Railway (root directory: `server`, start command: `node index.js`)
- **Database** → MongoDB Atlas (M0 free tier)

---

## Author

**Prathamesh Kulkarni** — Full Stack AI Engineer  
[LinkedIn](https://www.linkedin.com/in/prathamesh-kulkarni-a139631a7) · [GitHub](https://github.com/Prathamesh5976) · [Kydoscope](https://kydoscope.com)
