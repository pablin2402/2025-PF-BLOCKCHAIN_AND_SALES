const mongoose = require("mongoose");
const { Schema } = mongoose;
const messageSchema = new Schema({
  lastMessage: { type: String, require: true },
  date: { type: Date, require: true },
  read: {type: Boolean, require: true},
  type: {type: String, require: true},
  id_client: { type: String, require: true },
  creationDate: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model("Chat", messageSchema);
