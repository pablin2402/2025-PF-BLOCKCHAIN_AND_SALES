const mongoose = require("mongoose");
const { Schema } = mongoose;
const kanbanSchema = new Schema({
  title: { type: String, require: true },
  creationDate: { type: Date, default: Date.now },
  id_user: {type: String, require: true},
  tasks: { type : Array , "default" : [] },
  clients: { type : Array , "default" : [] },
  id_kanban: {type: String, require: true},
  id_owner: {type: String, require: true},
  color: {type: String, require: true},
});

module.exports = mongoose.model("Kanban", kanbanSchema);
