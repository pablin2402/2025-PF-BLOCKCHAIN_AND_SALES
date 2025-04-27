const mongoose = require("mongoose");
const { Schema } = mongoose;
const messageSchema = new Schema({
  body: { type: String, require: true },
  from:{ type: String, require: true },
  fromMe:{ type: Boolean, require: true},
  hasMedia:{ type: Boolean, require: true},
  to: { type: Number, require: true},
  id_client: { type: String, require: true },
  id_message:{ type: String, require: true },
  type: { type: String, require: true },
  link:{ type: String, require: true },
  typeList: { type : Array , "default" : [] },
  mediaKey: {type: Object, require: true},
  timestamp: { type: Number, default: () => Date.now() }
});

module.exports = mongoose.model("Message", messageSchema);
