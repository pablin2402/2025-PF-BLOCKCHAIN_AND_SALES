const mongoose = require("mongoose");
const { Schema } = mongoose;
const userLocationSchema = new Schema({
    sucursalName: { type: String, default: true },
    longitud: { type: Number, default: true },
    latitud: { type: Number, default: true },
    iconType: { type: String, default: true },
    logoColor: { type: String, default: true },
    creationDate: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    client_id: { type: String, require: true },
    id_owner: { type: String, require: true },
    direction: { type: String, require: true },
    houseNumber: { type: Number, require: true },
    city: { type: String, require: true },

});

module.exports = mongoose.model("ClientLocation", userLocationSchema);
