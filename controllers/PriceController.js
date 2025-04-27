const fs = require("fs");
const Price = require("../models/Price");

const getListOfPrice = async (req, res) => {
  const price = await Price.find();
  res.json(price);
};
const postPrice = async (req, res) => {
  try {
   const price = new Price({
        price: req.body.price,
        offerPrice: req.body.offerPrice,
        merchandiseCost: req.body.merchandiseCost,
        revenue: req.body.revenue,
        marginGain: req.body.marginGain,
        disscount: req.body.disscount,
        productId: req.body.productId
    });
    await price.save((err,price) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        price: price.price,
        offerPrice: price.offerPrice,
        merchandiseCost: price.merchandiseCost,
        revenue: price.revenue,
        marginGain: price.marginGain,
        disscount: price.disscount,
        productId: price.productId,
        id: price._id
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};
const getPriceByProductId = async (req, res) =>{
  const price = await Price.find({productId:String(req.body.productId),});
  res.json(price);
}
const uploadPriceProduct = async (req, res) => {
  const { productId,price, offerPrice, merchandiseCost, revenue, marginGain, disscount } = req.body;
  
    try {
      const product = await Price.findOneAndUpdate(
        { productId: productId },
        { price: price, offerPrice: offerPrice, merchandiseCost: merchandiseCost, revenue: revenue, marginGain: marginGain, disscount: disscount },
        { new: true }
      );
  
      if (!product) {
        return res.status(404).json({ error: 'No se encontró el product con los parámetros proporcionados' });
      }
  
      return res.json({ product });
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      res.status(500).json({ error: 'Error al actualizar el estadoxx' });
    }
}
module.exports = {
    getListOfPrice,
    postPrice,
    getPriceByProductId,
    uploadPriceProduct
};
