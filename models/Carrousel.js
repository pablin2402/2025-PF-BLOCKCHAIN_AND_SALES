const mongoose = require("mongoose");
const { Schema } = mongoose;
const carrouselSchema = new Schema({
  title: { type: String, require: true },
  creationDate: { type: Date, default: Date.now },
  id_user: {type: String, require: true},
  image: { type: String, require: true },
});

module.exports = mongoose.model("Carrousel", carrouselSchema);
