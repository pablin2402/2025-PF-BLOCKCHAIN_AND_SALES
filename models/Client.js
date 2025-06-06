const mongoose = require("mongoose");
const { Schema } = mongoose;

const roles = {
    values: ['ADMIN', 'USER','SALES','DELIVERY'],
    message: '{VALUE} no es un rol válido'
}
const userSchema = new Schema({

    email: { type: String, require: true },
    password: { type: String, require:true},
    role: { type: String, default: 'USER', enum: roles },
    active: { type: Boolean, default: true },
    id_owner: { type: String, require: true },
    creationDate: { type: Date, default: Date.now },

});

module.exports = mongoose.model("Client", userSchema);
