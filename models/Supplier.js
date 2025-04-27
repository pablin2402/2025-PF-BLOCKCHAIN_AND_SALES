const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const supplierSchema = new Schema({
  supplierName: { type: String, require: true },
  id_owner: { type: String, require: true },
  creationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Supplier", supplierSchema);