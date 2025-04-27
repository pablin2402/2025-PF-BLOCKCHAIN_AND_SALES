const mongoose = require("mongoose");
const { Schema } = mongoose;
const clientInfoSchema = new Schema({
  id_owner: { type: String, require: true },
  creationDate: { type: Date, default: Date.now },
  token: {type: String, require: true},
  number: { type: Number, require: true },
});

module.exports = mongoose.model("ClientInfo", clientInfoSchema);
