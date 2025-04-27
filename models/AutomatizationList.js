const mongoose = require("mongoose");
const { Schema } = mongoose;
const carrouselSchema = new Schema({
  title: { type: String, require: true },
  creationDate: { type: Date, default: Date.now },
  id_user: {type: String, require: true},
  id_owner: {type: String, require: true},
  type: {type: String, require: true},
  dailyHour: {type: Date, require: true},
  numberDate: {type: Number, require: true},
  messageToSend: {type: String, require: true},
  isEmail: {type: Boolean, require: true},
  isPhone: {type: Boolean, require: true},
  status: {type: Boolean, require: true},
  emailHtml: {type: String, require: true},
  people: {type: Object, require: true},
  dailySentStatus: {type: Boolean, require: true},
  weeklysentStatus: {type: Boolean, require: true},
  yearsentStatus: {type: Boolean, require: true},
  lastWeeklySent: {type: Date, require: true},
  lastMonthlySent: {type: Date, require: true},

});

module.exports = mongoose.model("AutomatizationList", carrouselSchema);
