const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = require("mongodb");
const producytSchema = new Schema({
  quantity: { type: Number, require: true },
  product_id:  { type: Schema.ObjectId, ref:"Product" },
  inventory: { type: Schema.ObjectId, ref:"Inventory" },
  id_user: { type: String, require: true },
  entry_date: { type: Date, default: Date.now },
  lote: { type: String, require: true },
  store: { type: String, require: true },
  dueDateRequired: { type: Boolean, require: true },
  due_date: { type: String, require: true },
  id_manager: { type: String, require: true },
});

module.exports = mongoose.model("InventaryManagement", producytSchema);
