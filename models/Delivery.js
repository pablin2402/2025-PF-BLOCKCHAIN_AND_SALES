const mongoose = require("mongoose");
const { Schema } = mongoose;

const roles = {
    values: ['SALES', 'SALESMANAGER','DELIVER'],
    message: '{VALUE} no es un rol válido'
}
const userSchema = new Schema({
    fullName:   { type: String, require: true },
    lastName:   { type: String, require: true },
    email: { type: String, unique: true, require: true },
    identificationNumber: { type: String, unique: true, require: true },
    phoneNumber:{ type: Number, unique: true, require: true },
    creationDate: { type: Date, default: Date.now },
    role: { type: String, default: 'SALES', enum: roles },
    active: { type: Boolean, default: true },
    id_owner: { type: String, require: true },
    client_location: { type: Schema.ObjectId, ref:"ClientLocation" },
    userId: { type: Schema.ObjectId, ref:"Client" },
});

module.exports = mongoose.model("Delivery", userSchema);
