const mongoose = require("mongoose");
const { Schema } = mongoose;


const userSchema = new Schema({
    delivery: { type: Schema.ObjectId, ref:"Delivery" },
    creationDate: { type: Date, default: Date.now },
    details: { type: String, require: true },
    route: { type : Array , "default" : [] },
    status: { type: String, require: true },
    startDate: { type: Date, require: true },
    endDate: { type: Date, require: true },
    id_owner: { type: String, require: true },
    progress:  { type: Number, require: true },
    startDateRouteSales: { type: Date, require: true },

});

module.exports = mongoose.model("RouteDelivery", userSchema);
