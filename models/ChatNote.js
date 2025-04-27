const mongoose = require("mongoose");
const { Schema } = mongoose;
const chatNoteSchema = new Schema({
  title: { type: String, require: true },
  creationDate: { type: Date, default: Date.now },
  id_user: {type: String, require: true},
  image: { type: String, require: true },
  icon: { type: String, require: true },
  number: { type: Number, require: true },
  userName: { type: String, require: true },
  message_type: { type: String, require: true },

});

module.exports = mongoose.model("ChatNote", chatNoteSchema);
