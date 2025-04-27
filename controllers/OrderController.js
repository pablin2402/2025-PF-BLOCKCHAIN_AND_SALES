const Order = require("../models/Order");
const mongoose = require("mongoose");

const getOrderById = async (req, res) => {
  try {
    const { id_owner, page, limit, status, paymentType, payStatus, salesId, fullName, startDate, endDate } = req.body;
    console.log(req.body)
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let matchStage = { id_owner };

    if (payStatus) matchStage.payStatus = payStatus;
    if (status) matchStage.orderStatus = status;
    if (salesId) matchStage.salesId = mongoose.Types.ObjectId(salesId);
    if (paymentType) matchStage.accountStatus = paymentType;

    const pipeline = [];

    if (startDate && endDate) {
      pipeline.push(
        {
          $addFields: {
            creationDateLocal: {
              $dateSubtract: {
                startDate: "$creationDate",
                unit: "hour",
                amount: 4,
              },
            },
          },
        },
        {
          $match: {
            ...matchStage,
            creationDateLocal: {
              $gte: new Date(`${startDate}T00:00:00Z`),
              $lte: new Date(`${endDate}T23:59:59Z`),
            },
          },
        }
      );
    } else {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $lookup: {
          from: "orderpays",
          localField: "_id",
          foreignField: "orderId",
          as: "pagos",
        },
      },
      {
        $addFields: {
          pagosOrdenados: {
            $cond: [
              { $gt: [{ $size: "$pagos" }, 0] },
              {
                $sortArray: {
                  input: "$pagos",
                  sortBy: { creationDate: 1 },
                },
              },
              [],
            ],
          },
        },
      },
      {
        $addFields: {
          pagosConAcumulado: {
            $cond: [
              { $gt: [{ $size: "$pagosOrdenados" }, 0] },
              {
                $reduce: {
                  input: "$pagosOrdenados",
                  initialValue: {
                    acumulado: 0,
                    pagos: [],
                    fechaUltimoPago: null,
                  },
                  in: {
                    $let: {
                      vars: {
                        nuevoTotal: {
                          $add: ["$$value.acumulado", "$$this.total"],
                        },
                      },
                      in: {
                        acumulado: "$$nuevoTotal",
                        pagos: {
                          $concatArrays: ["$$value.pagos", ["$$this"]],
                        },
                        fechaUltimoPago: {
                          $cond: [
                            {
                              $and: [
                                { $gte: ["$$nuevoTotal", "$totalAmount"] },
                                { $eq: ["$$value.fechaUltimoPago", null] },
                              ],
                            },
                            "$$this.creationDate",
                            "$$value.fechaUltimoPago",
                          ],
                        },
                      },
                    },
                  },
                },
              },
              {
                acumulado: 0,
                pagos: [],
                fechaUltimoPago: null,
              },
            ],
          },
        },
      },
      {
        $addFields: {
          totalPagado: "$pagosConAcumulado.acumulado",
          fechaUltimoPago: "$pagosConAcumulado.fechaUltimoPago",
          restante: {
            $subtract: ["$totalAmount", "$pagosConAcumulado.acumulado"],
          },
        },
      },
      {
        $addFields: {
          diasMora: {
            $cond: [
              { $ne: ["$fechaUltimoPago", null] },
              {
                $dateDiff: {
                  startDate: {
                    $dateSubtract: { startDate: "$dueDate", unit: "hour", amount: 4 }
                  },
                  endDate: {
                    $dateSubtract: { startDate: "$fechaUltimoPago", unit: "hour", amount: 4 }
                  },
                  unit: "day",
                },
              },
              {
                $dateDiff: {
                  startDate: {
                    $dateSubtract: { startDate: "$dueDate", unit: "hour", amount: 4 }
                  },
                  endDate: {
                    $dateSubtract: { startDate: "$$NOW", unit: "hour", amount: 4 }
                  },
                  unit: "day",
                },
              },
            ],
          },
          estadoPago: {
            $cond: {
              if: { $gt: ["$restante", 0] },
              then: "Falta pagar",
              else: "Pagado",
            },
          },
        },
      }
    );

    let orders = await Order.aggregate(pipeline);

    await Order.populate(orders, [
      { path: "salesId" },
      { path: "id_client" },
    ]);

    if (fullName) {
      const clientNameLower = fullName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      orders = orders.filter((order) => {
        const name = (order.id_client?.name || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        const lastName = (order.id_client?.lastName || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        return (
          name.includes(clientNameLower) || lastName.includes(clientNameLower)
        );
      });
    }

    const totalOrders = orders.length;
    const start = (pageNumber - 1) * limitNumber;
    const end = start + limitNumber;
    const paginatedOrders = orders.slice(start, end);

    res.json({
      orders: paginatedOrders,
      totalPages: Math.ceil(totalOrders / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error en getOrderById:", error);
    res.status(500).json({ message: "Error obteniendo órdenes", error });
  }
};


const deleteOrderById = async (req, res) => {
  try {
    const { id_owner, id } = req.body;
    const deletedOrder = await Order.findOneAndDelete({
      _id: id,
      id_owner: id_owner,
    });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Orden no encontrada o no autorizada para eliminar." });
    }

    res.json({ message: "Orden eliminada correctamente", order: deletedOrder });
  } catch (error) {
    console.error("Error eliminando la orden:", error);
    res.status(500).json({ message: "Error eliminando la orden", error });
  }
};

const getOrderSalesById = async (req, res) => {
  try {
    const { id_owner, year, month, startDate, endDate } = req.body;
    let filter = { id_owner };
    if (req.body.startDate && req.body.endDate) {
      filter.creationDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (req.body.year && req.body.month) {

      const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
      const endOfMonth = new Date(Date.UTC(year, month, 1));
      endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);
      filter.creationDate = {
        $gte: startOfMonth,
        $lt: endOfMonth
      };
    }

    const orderList = await Order.find(filter).populate("salesId");
    const totalOrders = orderList.length;
    const totalSalesAmount = orderList.reduce((sum, order) => sum + order.totalAmount, 0);

    const productSales = {};

    orderList.forEach((order) => {
      order.products.forEach((product) => {
        const productName = product.productName || "Producto desconocido";
        const quantity = product.qty;
        if (!productSales[productName]) {
          productSales[productName] = { productName, totalSold: 0 };
        }
        productSales[productName].totalSold += quantity;
      });
    });

    const productSalesArray = Object.values(productSales);

    const salesBySeller = orderList.reduce((acc, order) => {
      const sellerId = order.salesId?._id || "Desconocido";
      const sellerName = `${order.salesId?.fullName || "Desconocido"} ${order.salesId?.lastName || ""}`.trim();

      if (!acc[sellerId]) {
        acc[sellerId] = { sellerName, totalAmount: 0, totalOrders: 0, totalProducts: 0 };
      }

      acc[sellerId].totalAmount += order.totalAmount;
      acc[sellerId].totalOrders += 1;

      const productsSold = order.products.reduce((sum, product) => sum + product.quantity, 0);
      acc[sellerId].totalProducts += productsSold;

      return acc;
    }, {});

    res.json({
      orders: orderList,
      totalSalesAmount,
      totalOrders,
      salesBySeller: Object.values(salesBySeller),
      productSales: productSalesArray 
    });
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    res.status(500).json({ message: "Error obteniendo órdenes", error });
  }
};
const getOrderByIdAndClient = async (req, res) => {
  try {
    const { id_client, id_owner, page = 1, limit = 10, startDate, endDate, estadoPago } = req.body;

    const matchStage = {
      id_client: mongoose.Types.ObjectId(id_client),
      id_owner,
    };

    const pipeline = [];

    // Ajustar fechas con UTC-4
    if (startDate && endDate) {
      pipeline.push(
        {
          $addFields: {
            creationDateLocal: {
              $dateSubtract: {
                startDate: "$creationDate",
                unit: "hour",
                amount: 4, // Ajuste de 4 horas a UTC-4
              },
            },
          },
        },
        {
          $match: {
            ...matchStage,
            creationDateLocal: {
              $gte: new Date(`${startDate}T00:00:00Z`),
              $lte: new Date(`${endDate}T23:59:59Z`),
            },
          },
        }
      );
    } else {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $lookup: {
          from: "orderpays",
          localField: "_id",
          foreignField: "orderId",
          as: "pagos",
        },
      },
      {
        $addFields: {
          pagosOrdenados: {
            $cond: [
              { $gt: [{ $size: "$pagos" }, 0] },
              {
                $sortArray: {
                  input: "$pagos",
                  sortBy: { creationDate: 1 },
                },
              },
              [],
            ],
          },
        },
      },
      {
        $addFields: {
          pagosConAcumulado: {
            $cond: [
              { $gt: [{ $size: "$pagosOrdenados" }, 0] },
              {
                $reduce: {
                  input: "$pagosOrdenados",
                  initialValue: {
                    acumulado: 0,
                    pagos: [],
                    fechaUltimoPago: null,
                  },
                  in: {
                    $let: {
                      vars: {
                        nuevoTotal: {
                          $add: ["$$value.acumulado", "$$this.total"],
                        },
                      },
                      in: {
                        acumulado: "$$nuevoTotal",
                        pagos: {
                          $concatArrays: ["$$value.pagos", ["$$this"]],
                        },
                        fechaUltimoPago: {
                          $cond: [
                            {
                              $and: [
                                { $gte: ["$$nuevoTotal", "$totalAmount"] },
                                { $eq: ["$$value.fechaUltimoPago", null] },
                              ],
                            },
                            "$$this.creationDate",
                            "$$value.fechaUltimoPago",
                          ],
                        },
                      },
                    },
                  },
                },
              },
              {
                acumulado: 0,
                pagos: [],
                fechaUltimoPago: null,
              },
            ],
          },
        },
      },
      {
        $addFields: {
          totalPagado: "$pagosConAcumulado.acumulado",
          fechaUltimoPago: "$pagosConAcumulado.fechaUltimoPago",
          restante: {
            $subtract: ["$totalAmount", "$pagosConAcumulado.acumulado"],
          },
        },
      },
      {
        $addFields: {
          diasMora: {
            $cond: [
              { $ne: ["$fechaUltimoPago", null] },
              {
                $dateDiff: {
                  startDate: {
                    $dateSubtract: { startDate: "$dueDate", unit: "hour", amount: 4 },
                  },
                  endDate: {
                    $dateSubtract: { startDate: "$fechaUltimoPago", unit: "hour", amount: 4 },
                  },
                  unit: "day",
                },
              },
              {
                $dateDiff: {
                  startDate: {
                    $dateSubtract: { startDate: "$dueDate", unit: "hour", amount: 4 },
                  },
                  endDate: {
                    $dateSubtract: { startDate: "$$NOW", unit: "hour", amount: 4 },
                  },
                  unit: "day",
                },
              },
            ],
          },
          estadoPago: {
            $cond: {
              if: { $gt: ["$restante", 0] },
              then: "Falta pagar",
              else: "Pagado",
            },
          },
        },
      }
    );

    // Agregar paginación
    pipeline.push(
      { $sort: { creationDate: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const orders = await Order.aggregate(pipeline).exec();

    await Order.populate(orders, [
      { path: "salesId" }, 
      { path: "id_client" },
    ]);

    // Filtrado por nombre completo del cliente
    if (req.body.fullName) {
      const clientNameLower = req.body.fullName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      orders = orders.filter((order) => {
        const name = (order.id_client?.name || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        const lastName = (order.id_client?.lastName || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        return (
          name.includes(clientNameLower) || lastName.includes(clientNameLower)
        );
      });
    }

    const totalOrders = orders.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedOrders = orders.slice(start, end);

    res.json({
      orders: paginatedOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error al obtener órdenes con pagos:", error);
    res.status(500).json({ message: "Error al obtener las órdenes", error });
  }
};


const getOrderByIdAndSales = async (req, res) => {
  try {
    const {
      id_owner,
      salesId,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(salesId)) {
      return res.status(400).json({ message: "salesId no es un ObjectId válido" });
    }

    const matchStage = {
      id_owner,
      salesId: new mongoose.Types.ObjectId(salesId),
    };

    const pipeline = [];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);

      if (start > endD) {
        return res.status(400).json({ message: "startDate no puede ser mayor a endDate" });
      }

      pipeline.push(
        {
          $addFields: {
            creationDateLocal: {
              $dateSubtract: {
                startDate: "$creationDate",
                unit: "hour",
                amount: 4, 
              },
            },
          },
        },
        {
          $match: {
            ...matchStage,
            creationDateLocal: {
              $gte: new Date(`${startDate}T00:00:00Z`),
              $lte: new Date(`${endDate}T23:59:59Z`),
            },
          },
        }
      );
    } else {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $lookup: {
          from: "orderpays",
          localField: "_id",
          foreignField: "orderId",
          as: "pagos"
        }
      },
      {
        $addFields: {
          totalPagado: { $sum: "$pagos.total" },
          restante: { $subtract: ["$totalAmount", { $sum: "$pagos.total" }] }
        }
      }
    );

    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Order.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    pipeline.push(
      { $sort: { creationDate: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const orders = await Order.aggregate(pipeline);
    await Order.populate(orders, [
      { path: "salesId" }, 
      { path: "id_client" } 
    ]);

    res.json({
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error al obtener las órdenes", error });
  }
};


const postOrder = (req, res) => {
  try {
    const order = new Order({
      receiveNumber: req.body.receiveNumber,
      noteAditional: req.body.noteAditional || "",
      id_owner: req.body.id_owner,
      products: req.body.products || [],
      dissccount: req.body.dissccount || 0,
      tax: req.body.tax || 0,
      totalAmount: req.body.totalAmount || 0,
      nit: req.body.nit || "",
      razonSocial: req.body.razonSocial || "",
      cellphone: req.body.cellphone || "",
      direction: req.body.direction || "",
      accountStatus: req.body.accountStatus || "pending",
      dueDate: req.body.dueDate === "No disponible" ? null : req.body.dueDate,
      id_client: req.body.id_client || "",
      salesId: req.body.salesId || "",
      creationDate: req.body.creationDate,
      orderStatus: "deliver",
      payStatus: "Pendiente"
    });
    order.save((err, savedOrder) => {
      if (err) {
        console.error("Error al guardar la orden:", err);
        return res.status(500).send({ message: "Error al guardar la orden." });
      }

      res.status(200).send(savedOrder);
    });
  } catch (e) {
    console.error("Error en el servidor:", e);
    res.status(500).send({ message: "Error en el servidor." });
  }
};
const getOrdersByYear = async (req, res) => {
  try {
    const { id_owner, year } = req.body;

    const salesData = await Order.aggregate([
      {
        $match: {
          id_owner,
          creationDate: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${parseInt(year) + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$creationDate" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const completeSales = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = salesData.find((item) => item._id === month);
      return {
        month,
        totalSales: found ? found.totalSales : 0,
      };
    });

    res.json({ salesData: completeSales });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo ventas", error });
  }
};

const deleteOrder = async (req, res) => {
  const order_id = req.body.order_id;
  const deleteProduct = await Order.deleteOne({ order_id: order_id });

  if (deleteProduct.deletedCount === 0) {
    return res.status(404).json({ error: 'Orden no encontrado' });
  }
  return res.status(200).json({ message: 'Orden eliminado correctamente' });
};
const getOrderByDeliverStatusAnd = async (req, res) => {
  try {
    const { id_owner, salesId, orderStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.body.salesId)) {
      return res.status(400).json({ message: "salesId no es válido" });
    }
    const query = {
      id_owner: req.body.id_owner,
      salesId: new mongoose.Types.ObjectId(salesId),
    };
    if (req.body.orderStatus) {
      query.orderStatus = req.body.orderStatus;
    }
    const orderList = await Order.find(query)
      .populate("salesId")
      .populate("id_client");

    res.json(orderList);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error al obtener las órdenes", error: error.message });
  }
};

module.exports = {
    getOrderById,
    getOrderByIdAndClient,
    postOrder,
    deleteOrder,
    getOrderSalesById,
    getOrdersByYear,
    getOrderByIdAndSales,
    getOrderByDeliverStatusAnd,
    deleteOrderById
};
