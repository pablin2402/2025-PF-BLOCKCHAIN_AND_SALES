const fs = require("fs");
const Inventory = require("../models/Inventory");

const getListOfInventary = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .skip((req.body.page - 1) * req.body.limit)
      .limit(Number(req.body.limit)); 
    const totalItems = await Inventory.countDocuments(); 

    res.json({
      totalPages:  Math.ceil(totalItems / req.body.limit),
      currentPage: Number(req.body.page),
      totalItems,
      data: inventory,
    });
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const postInventary = (req, res) => {
  try {
   const inventory = new Inventory({
    productId: req.body.productId,
    userId: req.body.userId,
    quantity:  req.body.quantity,
    dueDate:  req.body.dueDate,
    dueDateRequired:  req.body.dueDateRequired,
    store: req.body.store,
    });
    inventory.save((err, inventory) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        productId: inventory.productId,
        userId: inventory.userId,
        quantity:  inventory.quantity,
        dueDate:  inventory.dueDate,
        dueDateRequired:  inventory.dueDateRequired,
        store: inventory.store,
        id: inventory._id
      });
    });
  } catch (e) {
  }
};
const getInventaryByProductId = async (req, res) => {
  try {
    let query = { userId: String(req.body.id_user) };
    const inventory = await Inventory.find(query)
    .skip((req.body.page - 1) * req.body.limit)
    .limit(Number(req.body.limit));
    const totalItems = await Inventory.countDocuments(query);
    res.json({
      totalPages: Math.ceil(totalItems / req.body.limit),
      currentPage: Number(req.body.page),
      totalItems,
      data: inventory,
    });
  } catch (error) {
    console.error("Error al obtener inventario por productId:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


const updateQuantity = async (req, res) => {
  try {
    const updatedProduct = await Inventory.findOneAndUpdate(
      { productId: req.body.productId },
      { quantity: req.body.quantity },
      { new: true }
    );
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar la cantidad del inventario:', error);
  }
}

module.exports = {
    getListOfInventary,
    postInventary,
    getInventaryByProductId,
    updateQuantity
};
