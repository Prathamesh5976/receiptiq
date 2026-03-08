//imports
require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
connectDB();

// Initialize Express app
const app = express();
const PORT = 5000;

// Import routes
const receiptRoute = require("./routes/receipt");
const chatRoute = require("./routes/chat");
// Enable CORS
app.use(cors());
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Use routes
app.use("/api/receipts", receiptRoute);
app.use("/api/chat", chatRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
