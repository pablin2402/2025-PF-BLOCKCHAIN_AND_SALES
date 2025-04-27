const mongoose = require("mongoose");
const { Schema } = mongoose;
const textProcess = new Schema({
  text: { type : String , default :true },
  date: { type: Date, default: Date.now },
  footer: {type: String, require: true},
  idClient: { type: String, require: true },
  action: { type : Array , "default" : [] },
  template_message: {type: String, require: true},
});

module.exports = mongoose.model("TemplateMessage", textProcess);
