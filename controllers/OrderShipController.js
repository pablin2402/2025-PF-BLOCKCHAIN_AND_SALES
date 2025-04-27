const OrderShip = require("../models/OrderShip");

const getOrderShipById = async (req, res) => {
  const orderList = await Order.find({id_owner: req.body.id_owner});
  res.json(orderList);
};
const postOrderShip = (req, res) => {
  try {
   const order = new OrderShip({
    orderShipId: req.body.orderShipId,
    orderName: req.body.OrderName,
    receiveNumber:req.body.receiveNumber,
    noteAditional: req.body.noteAditional,
    color: req.body.color,
    userId: req.body.userId,
    id_owner: req.body.id_owner,
    products: req.body.products,
    dissccount: req.body.dissccount,
    tax: req.body.tax,
    totalAmount:req.body.totalAmount
    });
    order.save((err) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
    });
  } catch (e) {
    myConsole.log(e);
 }
};

module.exports = {
    getOrderShipById,
    postOrderShip,
};
