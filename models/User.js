const mongoose = require("mongoose");
const { Schema } = mongoose;
const clientSchema = new Schema({
  name: { type: String, require: true }, //REQUIRED
  lastName: { type: String, require: true },
  profilePicture: { type: String, require: true },
  icon: { type: String, require: true },//REQUIRED or DEFAULT
  creationDate: { type: Date, default: Date.now }, 
  directionId: {type: String, require: true},
  number:{type: Number, require: true}, //REQUIRED
  identityNumber:{type: Number, require: true}, //REQUIRED
  company: { type: String, require: true },
  email: { type: String, require: true },
  socialNetwork: { type: String, require: true },
  notes: { type: String, require: true },
  id_user: { type: String, require: true },
  id_owner: { type: String, require: true },
  status: { type: String, require: true },
  userCategory: { type: String, require: true },
  client_location: { type: Schema.ObjectId, ref:"ClientLocation" },
  sales_id: { type: Schema.ObjectId, ref:"SalesMan" },

});

module.exports = mongoose.model("User", clientSchema);
