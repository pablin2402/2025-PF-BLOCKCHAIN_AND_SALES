const mongoose = require("mongoose");
const { Schema } = mongoose;
const carrouselSchema = new Schema({
  title: { type: String, require: true },
  creationDate: { type: Date, default: Date.now },
  id_user: {type: String, require: true},
  id_owner: {type: String, require: true},
  type: {type: String, require: true},
  dailyHour: {type: String, require: true},
  messageToSend: {type: String, require: true},
  isEmail: {type: Boolean, require: true},
  isPhone: {type: Boolean, require: true},

});

module.exports = mongoose.model("Automatization", carrouselSchema);
