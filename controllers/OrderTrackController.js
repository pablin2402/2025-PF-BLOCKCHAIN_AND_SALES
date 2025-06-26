const OrderTrack = require("../models/OrderTrack");
const mongoose = require("mongoose");

const isValidObjectId = (id) => {
    return id && typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
};
const createOrderEvent = async (req, res) => {
    try {
      const {
        orderId,
        eventType,
        triggeredBySalesman,
        triggeredByDelivery,
        triggeredByUser,
        location
      } = req.body;
      const event = new OrderTrack({
        orderId: isValidObjectId(orderId) ? new mongoose.Types.ObjectId(orderId) : null,
        eventType,
        triggeredBySalesman: isValidObjectId(triggeredBySalesman) ? new mongoose.Types.ObjectId(triggeredBySalesman) : null,
        triggeredByDelivery: isValidObjectId(triggeredByDelivery) ? new mongoose.Types.ObjectId(triggeredByDelivery) : null,
        triggeredByUser: isValidObjectId(triggeredByUser) ? new mongoose.Types.ObjectId(triggeredByUser) : null,
        location: location || null,
      });
  
      await event.save();
  
      res.status(200).send({
        message: "Evento creado correctamente",
        data: event
      });
    } catch (error) {
      console.error("Error al crear evento:", error);
      res.status(500).json({ message: "Error al crear el evento", error });
    }
};
const getOrderEventsByOrderId = async (req, res) => {
  try {
    const events = await OrderTrack.find({ orderId: new mongoose.Types.ObjectId(req.body.orderId) })
      .populate("triggeredBySalesman")
      .populate("triggeredByDelivery")
      .populate("triggeredByUser")
      .sort({ timestamp: 1 });

    res.json(events);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ message: "Error al obtener eventos", error });
  }
};
module.exports = {
  createOrderEvent,
  getOrderEventsByOrderId
};
