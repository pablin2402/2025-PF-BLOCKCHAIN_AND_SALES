const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const categorySchema = new Schema({
  categoryName: { type: String, require: true },
  category: { type: String, require: true },
  categoryImage: { type: String, require: true },
  userId: { type: String, require: true },
  categoryColor: { type: String, require: true },
  id: { type: ObjectId, require: true },
  id_owner: { type: String, require: true },
});

module.exports = mongoose.model("Category", categorySchema);
  