const mongoose = require("mongoose");
const { Schema } = mongoose;


const salesSchema = new Schema({
    id_owner: { type: String, require: true },
    region: { type: String, require: true },
    lyne: { type: String, require: true },
    numberOfBoxes: { type: Number, require: true },
    saleLastYear:{ type: Number, require: true },
    startdate: { type: Date, require: true },
    endDate: { type: Date, require: true },
    creationDate: { type: Date, default: Date.now },
    salesManId: { type: Schema.ObjectId, ref:"SalesMan" },
    id: { type: String, require: true },
});

module.exports = mongoose.model("SalesObjectiveSalesMan", salesSchema);
