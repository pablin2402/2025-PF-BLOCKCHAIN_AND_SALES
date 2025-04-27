const fs = require("fs");
const Carrousel = require("../models/Carrousel");

const getCarrousel = async (req, res) => {
  const carrousel = await Carrousel.find();
  res.json(carrousel);
};
module.exports = {
    getCarrousel
  };