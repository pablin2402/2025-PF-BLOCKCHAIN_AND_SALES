const mongoose = require("mongoose");
const { Schema } = mongoose;
const messageSchema = new Schema({
  fullMessage: { type: String, require: true },
  answerName: { type: String, require: true },
  date: { type: Date, require: true },
  type: {type: String, require: true},
  id_client: { type: String, require: true },
  id_owner:{ type: String, require: true },
  message_type: { type: String, require: true },
});

module.exports = mongoose.model("AnswerMessage", messageSchema);
