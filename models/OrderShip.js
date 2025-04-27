const mongoose = require("mongoose");
const { Schema } = mongoose;
const orderShipSchema = new Schema({
  orderShipId: { type: String, require: true },
  orderId: { type: Schema.ObjectId, ref: "Order" },
  transportId:  {type:String, require: true},
  orderStatus: {type: String, require:true},
  userId: { type: String, require: true },
  realTimeLocation: { type: String, require: true },
  id_owner: { type: String, require: true },

});

module.exports = mongoose.model("OrderShip", orderShipSchema);
  