const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const ReceiptSchema = new mongoose.Schema({
  merchant: { type: String, required: true },
  date: { type: String, required: true },
  items: [ItemSchema],
  total: { type: Number, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  embedding: {
    type: [Number],
    default: undefined,
  },
});

module.exports = mongoose.model("Receipt", ReceiptSchema);
