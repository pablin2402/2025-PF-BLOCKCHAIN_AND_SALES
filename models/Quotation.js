const mongoose = require("mongoose");
const { Schema } = mongoose;
const quotationSchema = new Schema({
  quotationName: { type: String, require: true },
  totalAmount: { type: Number, require: true },
  receiveNumber:{ type: Number, require: true },
  creationDate: { type: Date, default: Date.now },
  noteAditional: { type: String, require: true },
  color: { type: String, require: true },
  userId: { type: String, require: true },
  tasks: { type : Array , "default" : [] },
});

module.exports = mongoose.model("Quotation", quotationSchema);
  