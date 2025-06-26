const mongoose = require("mongoose");
const { Schema } = mongoose;
const orderSchema = new Schema({
  receiveNumber:{ type: String, require: true },
  creationDate: { type: Date, require: true },
  noteAditional: { type: String, require: true },
  id_owner: { type: String, require: true },
  products: { type : Array , "default" : [] },
  dissccount: { type: Number, require: true },
  tax: { type: Number, require: true },
  totalAmount: { type: Number, require: true },
  nit: { type: Number, require: true },
  razonSocial: { type: String, require: true },
  cellphone: { type: Number, require: true },
  direction: { type: String, require: true },
  accountStatus: { type: String, require: true },
  orderStatus: { type: String, require: true },
  payStatus: { type: String, require: true },
  dueDate: { type: Date},
  region:{type: String, require: true},
  id_client: { type: Schema.ObjectId, ref:"User" },
  salesId: { type: Schema.ObjectId, ref:"SalesMan" },
  orderTrackId: { type: Schema.ObjectId, ref:"Delivery" },

});

module.exports = mongoose.model("Order", orderSchema);
  