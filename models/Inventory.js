const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = require("mongodb");

const inventory = new Schema({
  productId: { type: String, require: true },
  userId: { type: String, require: true },
  quantity: { type: Number, require: true },
  date:  { type: Date, default: Date.now },
  dueDate: { type: Date, require: false },
  dueDateRequired: { type: Boolean, require: true },
  store: { type: String, require: true },
});

module.exports = mongoose.model("Inventory", inventory);
  