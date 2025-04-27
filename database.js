const mongoose = require("mongoose");
const { MongoStore } = require('wwebjs-mongo');

const URI =
  "mongodb+srv://pablo:PpR2402174064@cluster0.q40rfxx.mongodb.net/API?retryWrites=true&w=majority";
mongoose.set("strictQuery", false);

let store; 

mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => 
    console.log("Base de datos conectada"),
    store = new MongoStore({mongoose: mongoose})
  )
  .catch((err) => console.log(err));

  module.exports = {
    mongoose,
    store,
  };