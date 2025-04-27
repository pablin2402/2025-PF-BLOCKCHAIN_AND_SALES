const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  orderId: { type: Schema.ObjectId, ref: "Order" },
  sales_id: { type: Schema.ObjectId, ref: "SalesMan" },
  saleImage: { type: String, require: true },
  total: { type: Number, require: true },
  note: { type: String, require: true },
  creationDate: { type: Date, default: Date.now },
  id_owner: { type: String, require: true },
  numberOrden: { type: String, require: true },
  paymentStatus: { type: String, require: true },
  id_client: { type: Schema.ObjectId, ref: "User" },
});

module.exports = mongoose.model("OrderPay", orderSchema);
