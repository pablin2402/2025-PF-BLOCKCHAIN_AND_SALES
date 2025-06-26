const mongoose = require("mongoose");
const { Schema } = mongoose;


const salesSchema = new Schema({
    id_owner: { type: String, require: true },
    region: { type: String, require: true },
    lyne: { type: String, require: true },
    objective: { type: Number, require: true },
    saleLastYear:{ type: Number, require: true },
    acumulateSales: { type: Number, require: true },
    currentSaleVsSameMonthLastYear: { type: Number, require: true },
    saleVsEstablishedObjectiveMonth: { type: Number, require: true },
    date: { type: Date, require: true },
    creationDate: { type: Date, default: Date.now },
    startDate: { type: Date, require: true },
    endDate: { type: Date, require: true },
    creationDate: { type: Date, require: true },
    id: { type: String, require: true },
});

module.exports = mongoose.model("SalesObjectiveRegion", salesSchema);
