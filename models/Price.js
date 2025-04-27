const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const priceSchema = new Schema({
  price: { type: Number, require: true },
  offerPrice: { type: Boolean, require: true },
  merchandiseCost: { type: Number, require: true },
  revenue: { type: Number, require: true },
  marginGain: { type: Number, require: true },
  disscount: { type: Number, require: true },  
  productId: { type: String, require: true },
  id:  { type: ObjectId, require: true },
});

module.exports = mongoose.model("Price", priceSchema);
  