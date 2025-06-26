const Order = require("../models/Order");
const mongoose = require("mongoose");
const tf = require("@tensorflow/tfjs");

async function trainAndPredictLSTM(productSales, lookBack = 12, forecastHorizon = 3) {
  const values = Object.entries(productSales)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([, v]) => v);

  if (values.length <= lookBack) {
    throw new Error("No hay suficientes datos para entrenar.");
  }

  // Normalizar
  const max = Math.max(...values);
  const normalized = values.map(v => v / max);

  // Crear secuencias X e Y
  const X = [];
  const y = [];
  for (let i = 0; i < normalized.length - lookBack; i++) {
    X.push(normalized.slice(i, i + lookBack));
    y.push(normalized[i + lookBack]);
  }

  const xs = tf.tensor2d(X).reshape([X.length, lookBack, 1]);
  const ys = tf.tensor2d(y);

  // Crear modelo LSTM
  const model = tf.sequential();
  model.add(tf.layers.lstm({ units: 50, inputShape: [lookBack, 1] }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({ loss: "meanSquaredError", optimizer: "adam" });

  // Entrenar
  await model.fit(xs, ys, { epochs: 100, verbose: 0 });

  // Predecir
  let input = normalized.slice(-lookBack);
  const predictions = [];

  for (let i = 0; i < forecastHorizon; i++) {
    const pred = model.predict(tf.tensor2d([input]).reshape([1, lookBack, 1]));
    const next = (await pred.data())[0];
    predictions.push(next * max);
    input = [...input.slice(1), next];
  }

  return predictions;
}

const getCategorySummary = async (req, res) => {
  try {
    const { startDate, endDate, id_owner, salesId, payStatus, region } = req.body;

    const matchStage = {};

    if (startDate && endDate) {
      matchStage.creationDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (id_owner) matchStage.id_owner = id_owner;
    if (salesId) matchStage.salesId = new mongoose.Types.ObjectId(salesId);
    if (payStatus) matchStage.payStatus = payStatus;
    if (region) matchStage.region = region;

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$products" },
      {
        $group: {
          _id: {
            categoria: "$products.categoria",
            region: "$region",
          },
          totalCajas: { $sum: "$products.caja" },
          totalBotellas: {
            $sum: {
              $multiply: ["$products.caja", "$products.unidadesPorCaja"],
            },
          },
          pedidos: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          categoria: "$_id.categoria",
          region: "$_id.region",
          totalCajas: 1,
          totalBotellas: 1,
          pedidos: 1,
        },
      },
      { $sort: { region: 1, categoria: 1 } },
    ];

    const results = await Order.aggregate(pipeline);
    res.json(results);
  } catch (error) {
    console.error("Error al generar el resumen por categoría y región:", error);
    res.status(500).json({ error: "Error en el servidor al procesar el reporte." });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate, region, salesId } = req.body;
    const matchStage = {
      creationDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (region) {
      matchStage.region = region;
    }

    if (salesId) {
      matchStage.salesId = new mongoose.Types.ObjectId(salesId);
    }

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$products" },
      {
        $group: {
          _id: {
            region: "$region",
            producto: "$products.nombre",
            mes: { $month: { $toDate: "$creationDate" } },
            año: { $year: { $toDate: "$creationDate" } },
            vendedor: "$salesId",
          },
          totalCajas: { $sum: "$products.caja" },
          totalBotellas: {
            $sum: {
              $multiply: ["$products.caja", "$products.unidadesPorCaja"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          region: "$_id.region",
          producto: "$_id.producto",
          mes: "$_id.mes",
          año: "$_id.año",
          vendedor: "$_id.vendedor",
          totalCajas: 1,
          totalBotellas: 1,
        },
      },
      { $sort: { año: 1, mes: 1, producto: 1 } },
    ];
    const results = await Order.aggregate(pipeline);

    res.json(results);
  } catch (error) {
    console.error("Error en getSalesSummary:", error);
    res.status(500).json({ error: "Error al generar el resumen de ventas." });
  }
};
const predictSalesForTopProducts = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getUTCFullYear() - 10, 0, 1);
    const endDate = new Date(now.getUTCFullYear() + 1, 0, 1);

    const matchStage = {
      $match: {
        creationDate: { $gte: startDate, $lt: endDate },
      },
    };

    const unwindStage = { $unwind: "$products" };

    const groupStage = {
      $group: {
        _id: "$products.nombre",
        totalCantidad: { $sum: "$products.cantidad" },
      },
    };

    const sortStage = { $sort: { totalCantidad: -1 } };
    const limitStage = { $limit: 10 };

    const topProductsAgg = [matchStage, unwindStage, groupStage, sortStage, limitStage];
    const topProducts = await Order.aggregate(topProductsAgg);

    const orders = await Order.find({ creationDate: { $gte: startDate, $lt: endDate } });

    const predictions = await Promise.all(
      topProducts.map(async (product) => {
        try {
          const ventasPorMes = generateMonthlySalesData(orders, product._id);
          const forecast = await trainAndPredictLSTM(ventasPorMes);
          return {
            nombre: product._id,
            totalCantidad: product.totalCantidad,
            forecast: forecast.map((val, i) => ({
              mes: `+${i + 1}`,
              valor: Math.round(val),
            })),
          };
        } catch (err) {
          return {
            nombre: product._id,
            totalCantidad: product.totalCantidad,
            forecast: [],
            error: "Insuficientes datos para predecir",
          };
        }
      })
    );
    res.json({ data: predictions });
  } catch (err) {
    console.error("Error al predecir:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id_owner, page, limit, status, paymentType, payStatus, salesId, fullName, startDate, endDate,region } = req.body;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let matchStage = { id_owner };
    if (region) matchStage.region = region;
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
    pipeline.push({
      $sort: { creationDate: -1 }
    });

    let orders = await Order.aggregate(pipeline);

    await Order.populate(orders, [
      {
        path: "salesId"
      },
      {
        path: "orderTrackId"
      },
      {
        path: "id_client",
        populate: {
          path: "client_location"
        }
      }
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
      totalRecords: totalOrders
    });
  } catch (error) {
    console.error("Error en getOrderById:", error);
    res.status(500).json({ message: "Error obteniendo órdenes", error });
  }
};
const getOrderByIdAndOrderStatus = async (req, res) => {
  try {
    const { id_owner, page, limit, status, paymentType, payStatus, salesId, fullName, startDate, endDate,region } = req.body;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let matchStage = { id_owner };
    if (region) matchStage.region = region;
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
    pipeline.push({
      $sort: { creationDate: -1 }
    });

    let orders = await Order.aggregate(pipeline);

    await Order.populate(orders, [
      {
        path: "salesId"
      },
      {
        path: "orderTrackId"
      },
      {
        path: "id_client",
        populate: {
          path: "client_location"
        }
      }
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
      totalRecords: totalOrders
    });
  } catch (error) {
    console.error("Error en getOrderById:", error);
    res.status(500).json({ message: "Error obteniendo órdenes", error });
  }
};
const getMostSoldProducts = async (req, res) => {
  try {
    const year = parseInt(req.body.year);
    const month = parseInt(req.body.month);
    const page = parseInt(req.body.page);
    const itemsPerPage = parseInt(req.body.itemsPerPage);

    const startDate = month
      ? new Date(Date.UTC(year, month - 1, 1))
      : new Date(Date.UTC(year, 0, 1));

    const endDate = month
      ? new Date(Date.UTC(year, month, 1))
      : new Date(Date.UTC(year + 1, 0, 1));

    const matchStage = {
      $match: {
        creationDate: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    };

    const aggregation = [
      matchStage,
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.nombre",
          totalCantidad: { $sum: "$products.cantidad" },
        },
      },
      { $sort: { totalCantidad: -1 } },
      {
        $facet: {
          paginatedResults: [
            { $skip: (page - 1) * itemsPerPage },
            { $limit: itemsPerPage },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const [result] = await Order.aggregate(aggregation);

    const totalItems = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    res.json({
      data: result.paginatedResults,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
      },
    });
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};
const deleteOrderById = async (req, res) => {
  const { _id, id_owner } = req.body;

  if (!_id || !id_owner) {
    return res.status(400).json({ success: false, message: "Faltan parámetros" });
  }

  try {
    const deleted = await Order.deleteOne({ _id, id_owner });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Orden no encontrada" });
    }

    return res.status(200).json({ success: true, message: "Orden eliminada" });
  } catch (err) {
    console.error("Error al eliminar orden:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
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
    const {
      id_client,
      id_owner,
      page,
      limit,
      startDate,
      endDate,
      payStatus,
      fullName,
    } = req.body;

    const matchStage = {
      id_client: mongoose.Types.ObjectId(id_client),
      id_owner,
    };

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
                    $dateSubtract: {
                      startDate: "$dueDate",
                      unit: "hour",
                      amount: 4,
                    },
                  },
                  endDate: {
                    $dateSubtract: {
                      startDate: "$fechaUltimoPago",
                      unit: "hour",
                      amount: 4,
                    },
                  },
                  unit: "day",
                },
              },
              {
                $dateDiff: {
                  startDate: {
                    $dateSubtract: {
                      startDate: "$dueDate",
                      unit: "hour",
                      amount: 4,
                    },
                  },
                  endDate: {
                    $dateSubtract: {
                      startDate: "$$NOW",
                      unit: "hour",
                      amount: 4,
                    },
                  },
                  unit: "day",
                },
              },
            ],
          },
          payStatus: {
            $cond: {
              if: { $gt: ["$restante", 0] },
              then: "Pendiente",
              else: "Pagado",
            },
          },
        },
      },
      ...(payStatus
        ? [
            {
              $match: {
                payStatus: payStatus,
              },
            },
          ]
        : [])
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

    const paginatedOrders = orders.slice(
      (parseInt(page) - 1) * parseInt(limit),
      parseInt(page) * parseInt(limit)
    );

    res.json({
      orders: paginatedOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
      items: totalOrders
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
      page,
      limit
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
      payStatus: "Pendiente",
      orderTrackId: req.body.orderTrackId,
      region: req.body.region
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
    if (!mongoose.Types.ObjectId.isValid(req.body.salesId)) {
      return res.status(400).json({ message: "salesId no es válido" });
    }
    const query = {
      id_owner: req.body.id_owner,
      salesId: new mongoose.Types.ObjectId(req.body.salesId),
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
const updateOrderTracking = async (req, res) => {
  try {
    const {
      _id,
      id_owner,
      receiveNumber,
      orderTrackId,
      orderStatus
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "El _id del pedido no es un ObjectId válido." });
    }

    if (!mongoose.Types.ObjectId.isValid(orderTrackId)) {
      return res.status(400).json({ message: "El orderTrackId no es un ObjectId válido." });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(_id),
        id_owner,
        receiveNumber
      },
      {
        $set: {
          orderTrackId: mongoose.Types.ObjectId(orderTrackId),
          orderStatus
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "No se encontró una orden con los datos proporcionados." });
    }

    res.status(200).json({
      message: "La orden fue actualizada exitosamente.",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Error al actualizar la orden:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

module.exports = {
  getOrderById,
  updateOrderTracking,
  getCategorySummary,
  getSalesSummary,
  getOrderByIdAndClient,
  postOrder,
  deleteOrder,
  getOrderSalesById,
  getOrdersByYear,
  getOrderByIdAndSales,
  getOrderByDeliverStatusAnd,
  deleteOrderById,
  getMostSoldProducts,
  predictSalesForTopProducts,
  getOrderByIdAndOrderStatus
};
