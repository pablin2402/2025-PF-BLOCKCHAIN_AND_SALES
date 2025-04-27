const mongoose = require("mongoose");
const { Schema } = mongoose;

const salesHistorial = new Schema({
  receiveNumber: { type : Number, default :true },
  creationDate: { type: Date, default: Date.now },
  name: {type: String, require: true},
  nitNumber: { type: String, require: true },
  productOrder: { type : Array , "default" : [] },
  totalAmount: {type: Number, require: true},
  note: {type: String, require: true},
  accountStatus: {type: String, require: true},
  dueDate: {type: Date, require: true},
  id_owner: {type: String, require: true},
  id_client: {type: String, require: true},
  
});

module.exports = mongoose.model("SalesHistorial", salesHistorial);
