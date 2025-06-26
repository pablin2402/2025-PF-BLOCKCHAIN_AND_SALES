const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderEventSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  eventType: {
    type: String,
    required: true
  },
  triggeredBySalesman: { type: Schema.Types.ObjectId, ref: "SalesMan", default: null },
  triggeredByDelivery: { type: Schema.Types.ObjectId, ref: "Delivery", default: null },
  triggeredByUser: { type: Schema.Types.ObjectId, ref: "User", default: null },
  location: {
    lat: Number,
    lng: Number
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("OrderTrack", orderEventSchema);
