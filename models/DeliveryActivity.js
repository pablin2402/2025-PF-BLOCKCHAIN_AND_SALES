const mongoose = require("mongoose");
const { Schema } = mongoose;


const userSchema = new Schema({
    delivery: { type: Schema.ObjectId, ref:"Delivery" },
    creationDate: { type: Date, default: Date.now },
    details: { type: String, require: true },
    clientName: { type: Schema.ObjectId, ref:"User" },
    latitude: { type: Number, require: true },
    longitude: { type: Number, default: true },
    location: { type: String, require: true },
    id_owner: { type: String, require: true },
    visitDuration: { type: String, required: true },
    visitDurationSeconds: { type: Number, required: true },
});

module.exports = mongoose.model("DeliveryActivy", userSchema);
