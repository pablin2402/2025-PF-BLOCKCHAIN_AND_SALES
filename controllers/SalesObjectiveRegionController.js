const SalesObjectiveRegion = require("../models/SalesObjectiveRegion");
const SalesObjectiveSalesMan = require("../models/SalesObjectiveSalesMan");
const SalesObjective = require("../models/SalesObjective");
const Order = require("../models/Order");
const mongoose = require("mongoose");

const postSalesObjectiveSalesMan = (req, res) => {
  try {
   const product = new SalesObjectiveSalesMan({
        id_owner: req.body.id_owner,
        region: req.body.region,
        lyne: req.body.lyne,
        numberOfBoxes: req.body.numberOfBoxes,
        saleLastYear:req.body.saleLastYear,
        startdate: req.body.startDate,
        endDate:req.body.endDate,
        id: req.body.id,
        salesManId: new mongoose.Types.ObjectId(req.body.salesManId)
    });
    product.save((err,product) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        id_owner: product.id_owner,
        region: product.region,
        lyne: product.lyne,
        numberOfBoxes: product.numberOfBoxes,
        saleLastYear: product.saleLastYear,
        startdate: product.acumulateSales,
        endDate: product.currentSaleVsSameMonthLastYear,
        id: product.id,
        salesManId: req.body.salesManId
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};
const getSalesObjectiveSalesManByIdAndOwner = async (req, res) => {
  try {
    const { startDate, endDate, region, payStatus, salesManId } = req.body;
    const matchObjective = {
      region,
      startdate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    };

    if (salesManId) {
      matchObjective.salesManId = new mongoose.Types.ObjectId(salesManId);
    }

    const results = await SalesObjectiveSalesMan.aggregate([
      { $match: matchObjective },

      {
        $lookup: {
          from: "orders",
          let: {
            salesManId: "$salesManId",
            lyne: "$lyne",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$salesId", "$$salesManId"] },
                    { $gte: ["$creationDate", new Date(startDate)] },
                    { $lte: ["$creationDate", new Date(endDate)] }
                  ]
                },
                ...(payStatus ? { payStatus } : {})
              }
            },
            { $unwind: "$products" },
            {
              $match: {
                $expr: { $eq: ["$products.lyne", "$$lyne"] }
              }
            },
            {
              $group: {
                _id: null,
                totalCantidad: { $sum: "$products.cantidad" },
                totalCajas: { $sum: "$products.caja" },
                totalUnidadesPorCaja: { $sum: "$products.unidadesPorCaja" }
              }
            }
          ],
          as: "ventas"
        }
      },
      {
        $unwind: {
          path: "$ventas",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "salesManId",
          foreignField: "_id",
          as: "vendedor"
        }
      },
      {
        $unwind: {
          path: "$vendedor",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          salesManId: "$salesManId",
          objetivoId: "$_id",
          lyne: 1,
          region: 1,
          numberOfBoxes: 1,
          saleLastYear: 1,
          startDate: "$startdate",
          endDate: 1,
          cantidad: { $ifNull: ["$ventas.totalCantidad", 0] },
          caja: { $ifNull: ["$ventas.totalCajas", 0] },
          unidadesPorCaja: { $ifNull: ["$ventas.totalUnidadesPorCaja", 0] },
          fullName: "$vendedor.fullName",
          lastName: "$vendedor.lastName"
        }
      }
    ]);

    res.status(200).json(results);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


const getSalesObjectiveRegionByIdAndOwner = async (req, res) => {
  try {
    const { id, id_owner, lyne } = req.body;

    if (!id || !id_owner || !lyne) {
      return res.status(400).send({ message: "Faltan parámetros obligatorios: id, id_owner o lyne." });
    }

    const results = await SalesObjectiveRegion.find({ id, id_owner, lyne });

    if (results.length === 0) {
      return res.status(404).send({ message: "No se encontraron resultados con esos filtros." });
    }

    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error al obtener los datos." });
  }
};
const getSalesObjective= async (req, res) => {
  try {
    const { id, id_owner,lyne ,region } = req.body;
    const results = await SalesObjective.find({ id, id_owner, lyne, region });
    if (results.length === 0) {
      return res.status(404).send({ message: "No se encontraron resultados con esos filtros." });
    }

    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error al obtener los datos." });
  }
};
const getSalesObjectiveGeneralByIdAndOwner = async (req, res) => {
  try {
    const { id_owner, startDate, endDate } = req.body;

    const query = {
      id_owner,
    };
    if (startDate && endDate) {
      query.startdate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const results = await SalesObjectiveRegion.find(query);
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error al obtener los datos." });
  }
};
const postSalesObjectiveRegion = (req, res) => {
  try {
   const product = new SalesObjectiveRegion({
        region: req.body.region,
        lyne: req.body.lyne,
        objective: req.body.objective,
        saleLastYear:req.body.saleLastYear,
        acumulateSales: req.body.acumulateSales,
        currentSaleVsSameMonthLastYear:req.body.currentSaleVsSameMonthLastYear,
        saleVsEstablishedObjectiveMonth:req.body.saleVsEstablishedObjectiveMonth,
        date:req.body.date,
        id: req.body.id,
        id_owner: req.body.id_owner,
        startDate: req.body.startDate,
        endDate: req.body.endDate
    });
    product.save((err,product) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        region: product.region,
        lyne: product.lyne,
        objective: product.objective,
        saleLastYear:product.saleLastYear,
        acumulateSales: product.acumulateSales,
        currentSaleVsSameMonthLastYear: product.currentSaleVsSameMonthLastYear,
        saleVsEstablishedObjectiveMonth: product.saleVsEstablishedObjectiveMonth,
        date: product.date,
        id: product.id,
        id_owner: product.id_owner,
        startDate: product.startDate,
        endDate: product.endDate
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};
const postSalesObjective = (req, res) => {
  try {
   const product = new SalesObjective({
        id_owner: req.body.id_owner,
        region: req.body.region,
        lyne: req.body.lyne,
        numberOfBoxes: req.body.numberOfBoxes,
        saleLastYear:req.body.saleLastYear,
        startdate: req.body.startDate,
        endDate:req.body.endDate,
        id: req.body.id,
    });
    product.save((err,product) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        id_owner: product.id_owner,
        region: product.region,
        lyne: product.lyne,
        numberOfBoxes: product.numberOfBoxes,
        saleLastYear: product.saleLastYear,
        startdate: product.acumulateSales,
        endDate: product.currentSaleVsSameMonthLastYear,
        id: product.id,
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};
const getObjectiveWithSalesData = async (req, res) => {
  try {
    let { startDate, endDate, id_owner, salesId, payStatus, region } = req.body;
    if (!startDate || !endDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const matchObjectiveStage = {};
    if (id_owner) matchObjectiveStage.id_owner = id_owner;
    if (region) matchObjectiveStage.region = region;
    matchObjectiveStage.startdate = { $lte: endDate };
    matchObjectiveStage.endDate = { $gte: startDate };

    const salesObjectivePipeline = [
      { $match: matchObjectiveStage },
      {
        $lookup: {
          from: "orders",
          let: {
            categoria: "$lyne",
            region: "$region",
            id_owner: "$id_owner",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$region", "$$region"] },
                    { $eq: ["$id_owner", "$$id_owner"] },
                    ...(salesId ? [{ $eq: ["$salesId", new mongoose.Types.ObjectId(salesId)] }] : []),
                    ...(payStatus ? [{ $eq: ["$payStatus", payStatus] }] : []),
                    // { $gte: ["$creationDate", startDate] },
                    // { $lte: ["$creationDate", endDate] },
                  ],
                },
              },
            },
            { $unwind: "$products" },
            {
              $match: {
                $expr: { $eq: ["$products.lyne", "$$categoria"] },
              },
            },
            {
              $group: {
                _id: null,
                totalCajas: { $sum: "$products.caja" },
                totalBotellas: {
                  $sum: { $multiply: ["$products.caja", "$products.unidadesPorCaja"] },
                },
                pedidos: { $sum: 1 },
              },
            },
          ],
          as: "ventas",
        },
      },
      {
        $unwind: {
          path: "$ventas",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          categoria: "$lyne",
          region: "$region",
          objective: "$numberOfBoxes",
          saleLastYear: "$saleLastYear",
          totalCajas: { $ifNull: ["$ventas.totalCajas", 0] },
          totalBotellas: { $ifNull: ["$ventas.totalBotellas", 0] },
          pedidos: { $ifNull: ["$ventas.pedidos", 0] },
          saleVsEstablishedObjectiveMonth: {
            $cond: [
              { $gt: ["$numberOfBoxes", 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ["$ventas.totalCajas", "$numberOfBoxes"] }, 100] },
                  2,
                ],
              },
              0,
            ],
          },
          currentSaleVsSameMonthLastYear: {
            $cond: [
              { $gt: ["$saleLastYear", 0] },
              {
                $round: [
                  { $divide: ["$ventas.totalCajas", "$saleLastYear"] },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { region: 1, cxategoria: 1 } },
    ];

    const result = await SalesObjective.aggregate(salesObjectivePipeline);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al generar el resumen combinado:", error);
    res.status(500).json({ error: "Error del servidor al combinar los datos." });
  }
};
const getOrdersWithSalesObjective = async (req, res) => {
  try {
    const { id_owner, startDate: inputStart, endDate: inputEnd } = req.body;

    if (!id_owner) {
      return res.status(400).json({ message: "id_owner es requerido" });
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)); 
    const userStart = inputStart ? new Date(inputStart) : currentMonthStart;
    const userEnd = inputEnd ? new Date(inputEnd) : currentMonthEnd;

    const objectives = await SalesObjectiveRegion.find({ id_owner });

    const results = await Promise.all(
      objectives.map(async (objective) => {
        const objStart = new Date(objective.startDate);
        const objEnd = new Date(objective.endDate);

        if (objEnd < userStart || objStart > userEnd) {
          return null;
        }
        const orderQuery = {
          id_owner: objective.id_owner,
          creationDate: { $gte: objStart, $lte: objEnd },
        };

        if (objective.region) {
          orderQuery.region = objective.region;
        }

        const orders = await Order.find(orderQuery);

        let totalCajas = 0;

        if (orders.length > 0) {
          orders.forEach(order => {
            if (Array.isArray(order.products)) {
              order.products.forEach(product => {
                totalCajas += product.caja || 0;
              });
            }
          });
        }

        return {
          lyne: objective.lyne,
          region: objective.region,
          cajasVendidas: totalCajas,
          objetivo: objective.objective || 0,
          numberOfBoxes: objective.numberOfBoxes || 0,
          saleLastYear: objective.saleLastYear || 0,
          _id: objective._id,
          startDate: objective.startDate,
          endDate: objective.endDate
        };
      })
    );

    const filteredResults = results.filter(Boolean);
    res.json(filteredResults);
  } catch (error) {
    console.error("Error al procesar objetivos con órdenes:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
const getSalesDataByLyne = async (req, res) => {
  try {
    const { id_owner, startDate: inputStart, endDate: inputEnd } = req.body;

    if (!id_owner) {
      return res.status(400).json({ message: "id_owner es requerido" });
    }

    const today = new Date();
    const userStart = inputStart ? new Date(inputStart) : new Date(today.getFullYear(), today.getMonth(), 1);
    const userEnd = inputEnd
      ? new Date(inputEnd)
      : new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const objetivos = await SalesObjective.find({
      id_owner,
      startdate: { $lte: userEnd },
      endDate: { $gte: userStart }
    });

    const acumuladoPorLyne = {};

    for (const objetivo of objetivos) {
      const objStart = new Date(objetivo.startdate);
      const objEnd = new Date(objetivo.endDate);

      const orders = await Order.find({
        id_owner,
        creationDate: { $gte: objStart, $lte: objEnd }
      });

      let cajasVendidas = 0;
      for (const order of orders) {
        if (!Array.isArray(order.products)) continue;
        for (const product of order.products) {
          if (product.lyne === objetivo.lyne) {
            cajasVendidas += product.caja || 0;
          }
        }
      }

      if (!acumuladoPorLyne[objetivo.lyne]) {
        acumuladoPorLyne[objetivo.lyne] = {
          lyne: objetivo.lyne,
          cajasVendidas: 0,
          objetivo: 0,
          saleLastYear: 0,
          regiones: new Set(),
          startDates: [],
          endDates: [],
          ids: []
        };
      }

      acumuladoPorLyne[objetivo.lyne].cajasVendidas += cajasVendidas;
      acumuladoPorLyne[objetivo.lyne].objetivo += objetivo.numberOfBoxes || 0;
      acumuladoPorLyne[objetivo.lyne].saleLastYear += objetivo.saleLastYear || 0;
      acumuladoPorLyne[objetivo.lyne].regiones.add(objetivo.region);
      acumuladoPorLyne[objetivo.lyne].startDates.push(objStart);
      acumuladoPorLyne[objetivo.lyne].endDates.push(objEnd);
      acumuladoPorLyne[objetivo.lyne].ids.push(objetivo._id);
    }

    const resultado = Object.values(acumuladoPorLyne).map(item => ({
      _id: item.ids[0],
      lyne: item.lyne,
      cajasVendidas: item.cajasVendidas,
      objetivo: item.objetivo,
      saleLastYear: item.saleLastYear,
      regiones: Array.from(item.regiones),
      startDate: new Date(Math.min(...item.startDates.map(d => d.getTime()))),
      endDate: new Date(Math.max(...item.endDates.map(d => d.getTime()))),
      objetivosIds: item.ids
    }));

    res.json(resultado);
  } catch (err) {
    console.error("Error al obtener resumen por lyne:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
const getObjectiveWithSalesDataProducts = async (req, res) => {
  try {
    let { startDate, endDate, id_owner, salesId, payStatus, region, lyne, page, limit} = req.body;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    if (!startDate || !endDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const matchObjectiveStage = {};
    if (id_owner) matchObjectiveStage.id_owner = id_owner;
    if (region) matchObjectiveStage.region = region;
    if (lyne) matchObjectiveStage.lyne = lyne;
    matchObjectiveStage.startdate = { $lte: endDate };
    matchObjectiveStage.endDate = { $gte: startDate };

    const salesObjectivePipeline = [
      { $match: matchObjectiveStage },
      {
        $lookup: {
          from: "orders",
          let: {
            categoria: "$lyne",
            region: "$region",
            id_owner: "$id_owner",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$region", "$$region"] },
                    { $eq: ["$id_owner", "$$id_owner"] },
                    ...(salesId ? [{ $eq: ["$salesId", new mongoose.Types.ObjectId(salesId)] }] : []),
                    ...(payStatus ? [{ $eq: ["$payStatus", payStatus] }] : []),
                    { $gte: ["$creationDate", startDate] },
                    { $lte: ["$creationDate", endDate] },
                  ],
                },
              },
            },
            { $unwind: "$products" },
            {
              $match: {
                $expr: { $eq: ["$products.lyne", "$$categoria"] },
              },
            },
            {
              $lookup: {
                from: "salesmen",
                localField: "salesId",
                foreignField: "_id",
                as: "salesmanInfo",
              },
            },
            { $unwind: { path: "$salesmanInfo", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                orderId: "$_id",
                receiveNumber: 1,
                creationDate: 1,
                productName: "$products.nombre",
                cantidad: "$products.caja",
                unidadesPorCaja: "$products.unidadesPorCaja",
                totalBotellas: { $multiply: ["$products.caja", "$products.unidadesPorCaja"] },
                payStatus: 1,
                salesId: "$salesmanInfo._id",
                salesFullName: "$salesmanInfo.fullName",
                salesLastName: "$salesmanInfo.lastName",
              },
            },
          ],
          as: "ventas",
        },
      },
      { $unwind: "$ventas" },
      {
        $project: {
          _id: "$_id",
          categoria: "$lyne",
          region: "$region",
          objective: "$numberOfBoxes",
          saleLastYear: "$saleLastYear",
          productName: "$ventas.productName",
          cantidadVendida: "$ventas.cantidad",
          unidadesPorCaja: "$ventas.unidadesPorCaja",
          totalBotellas: "$ventas.totalBotellas",
          orderId: "$ventas.orderId",
          receiveNumber: "$ventas.receiveNumber",
          creationDate: "$ventas.creationDate",
          payStatus: "$ventas.payStatus",
          salesId: "$ventas.salesId",
          salesFullName: "$ventas.salesFullName",
          salesLastName: "$ventas.salesLastName",
        },
      },
      { $sort: { region: 1, categoria: 1, productName: 1 } },
    ];

    const fullResult = await SalesObjective.aggregate(salesObjectivePipeline);

    const total = fullResult.length;
    const pages = Math.ceil(total / limit);
    const paginatedData = fullResult.slice(skip, skip + limit);

    res.status(200).json({
      total,
      page,
      pages,
      limit,
      data: paginatedData,
    });
  } catch (error) {
    console.error("Error al generar el resumen de productos vendidos:", error);
    res.status(500).json({ error: "Error del servidor al combinar los datos." });
  }
};
const updateSalesObjectiveRegion = async (req, res) => {
  try {
    const { _id, id_owner, saleLastYear, objective } = req.body;

    if (!_id || !id_owner) {
      return res.status(400).json({ message: "Faltan campos requeridos (_id, id_owner)" });
    }

    const updated = await SalesObjectiveRegion.findOneAndUpdate(
      { _id, id_owner },
      {
        $set: {
          saleLastYear,
          objective
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }

    res.json({ message: "Actualización exitosa", data: updated });
  } catch (error) {
    console.error("Error actualizando SalesObjectiveRegion:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
const deleteSalesObjectiveRegion = async (req, res) => {
  try {
    const { _id, id_owner } = req.body;
    if (!_id || !id_owner) {
      return res.status(400).json({ message: "Faltan campos requeridos (_id, id_owner)" });
    }

    const deleted = await SalesObjectiveRegion.findOneAndDelete({ _id, id_owner });

    if (!deleted) {
      return res.status(404).json({ message: "No se encontró el documento a eliminar" });
    }

    res.json({ message: "Documento eliminado correctamente", data: deleted });
  } catch (error) {
    console.error("Error eliminando SalesObjectiveRegion:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
const updateSalesObjective = async (req, res) => {
  try {
    const { _id, id_owner, numberOfBoxes, saleLastYear } = req.body;
    if (!_id || !id_owner) {
      return res.status(400).json({ message: "Faltan campos requeridos (_id, id_owner)" });
    }

    const updated = await SalesObjective.findOneAndUpdate(
      { _id, id_owner },
      {
        $set: {
          numberOfBoxes,
          saleLastYear
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }

    res.json({ message: "Actualización exitosa", data: updated });
  } catch (error) {
    console.error("Error actualizando SalesObjective:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
const deleteSalesObjective = async (req, res) => {
  try {
    const { _id, id_owner } = req.body;
    if (!_id || !id_owner) {
      return res.status(400).json({ message: "Faltan campos requeridos (_id, id_owner)" });
    }

    const deleted = await SalesObjective.findOneAndDelete({ _id, id_owner });

    if (!deleted) {
      return res.status(404).json({ message: "Documento no encontrado para eliminar" });
    }

    res.json({ message: "Eliminación exitosa", data: deleted });
  } catch (error) {
    console.error("Error eliminando SalesObjective:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  updateSalesObjective, deleteSalesObjective,deleteSalesObjectiveRegion,updateSalesObjectiveRegion,getObjectiveWithSalesDataProducts, postSalesObjective, getSalesObjectiveSalesManByIdAndOwner,postSalesObjectiveSalesMan,getSalesDataByLyne, getOrdersWithSalesObjective,getObjectiveWithSalesData,getSalesObjective,getSalesObjectiveRegionByIdAndOwner,postSalesObjectiveRegion,getSalesObjectiveGeneralByIdAndOwner
};
