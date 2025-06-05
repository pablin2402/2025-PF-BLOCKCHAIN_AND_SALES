const OrderPay = require("../models/OrderPay");
const mongoose = require("mongoose");
const Order = require("../models/Order");

const getOrderPay = async (req, res) => {
  try {
    const page = req.body.page || 1;
    const limit = req.body.limit || 0;
    let filter = { id_owner: String(req.body.id_owner) };
    const pipeline = [];

    if (req.body.startDate && req.body.endDate) {
      const startDate = new Date(req.body.startDate); 
      const endDate = new Date(req.body.endDate);
      endDate.setHours(23, 59, 59, 999);
      let endUTC4 = new Date(endDate.getTime() - 4 * 60 * 60 * 1000);
      endUTC4.setDate(endUTC4.getDate() + 1);
      console.log(startDate, endUTC4)
      if (startDate > endUTC4) {
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
            creationDateLocal: {
              $gte: new Date(startDate),
              $lte:endUTC4,
            },
          },
        }
      );
    } else {
      pipeline.push({ $match: filter });
    }

    if (req.body.status) {
      filter.paymentStatus = req.body.status;
    }
    if (req.body.id_client) {
      filter.id_client = req.body.id_client;
    }

    const allPaymentsRaw = await OrderPay.aggregate(pipeline) 
    await Order.populate(allPaymentsRaw, [
      { path: "id_client" } ,
      { path: "sales_id", model: "SalesMan" },  
      { path: "orderId" } 

    ]);
    let filteredPayments = allPaymentsRaw;
    if (req.body.clientName) {
      const clientNameLower = req.body.clientName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      filteredPayments = allPaymentsRaw.filter(p => {
        const name = (p.id_client?.name || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();

        const lastName = (p.id_client?.lastName || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();

        return name.includes(clientNameLower) || lastName.includes(clientNameLower);
      });
    }

    const totalRecords = filteredPayments.length;
    const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;
    const paginatedPayments = limit > 0
      ? filteredPayments.slice((page - 1) * limit, page * limit)
      : filteredPayments;

    const orderIds = paginatedPayments.map(p => p.orderId?._id).filter(Boolean);
    const allPayments = await OrderPay.find({ orderId: { $in: orderIds } }).lean();

    const paymentsWithDebt = paginatedPayments.map(payment => {
      const orderTotal = payment.orderId?.totalAmount || 0;
      const totalPaid = allPayments
        .filter(p => p.orderId?.toString() === payment.orderId?._id.toString())
        .reduce((sum, p) => sum + (p.total || 0), 0);
      const debt = orderTotal - totalPaid;
      return {
        ...payment,
        totalPaid,
        debt: debt > 0 ? debt : 0,
      };
    });

    res.json({
      data: paymentsWithDebt,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pagos" });
  }
};



const getOrderPayBySales = async (req, res) => {
    try {
      console.log(req.body)
      const page = req.body.page || 1;
      const limit = req.body.limit || 0;
  
      let filter = { id_owner: String(req.body.id_owner) };
  
      if (req.body.startDate && req.body.endDate) {
        const startUTC = new Date(req.body.startDate);
        const endUTC = new Date(req.body.endDate);
      
        const start = new Date(startUTC.getTime() - 4 * 60 * 60 * 1000);
        const end = new Date(endUTC.getTime() - 4 * 60 * 60 * 1000);
      
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      
        const startInUTC = new Date(start.getTime() + 4 * 60 * 60 * 1000);
        const endInUTC = new Date(end.getTime() + 4 * 60 * 60 * 1000);
      
        filter.creationDate = {
          $gte: startInUTC,
          $lte: endInUTC
        };
      }
      
      if (req.body.status) {
        filter.paymentStatus = req.body.status;
      }
  
      if (req.body.sales_id) {
        filter.sales_id = mongoose.Types.ObjectId(req.body.sales_id);
      }
  
  
      let payments = await OrderPay.find(filter)
        .populate({
            path: "orderId",
            populate: {
              path: "id_client",
            },
          })
        .populate("sales_id")
        .populate("id_client")
        .lean();
        
        if (req.body.clientName) {
            const searchTerm = req.body.clientName.toLowerCase();
            payments = payments.filter(item => {
                const client = item.orderId?.id_client;
                if (!client) return false;  
                const fullName = `${client.name} ${client.lastName}`.toLowerCase();
                return fullName.includes(searchTerm);
              });
       }

       if (!req.body.startDate || !req.body.endDate) {
         payments = payments.slice(-10);
       }
       const totalRecords = payments.length;
       const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;
   
       const paginatedData = limit > 0
         ? payments.slice((page - 1) * limit, page * limit)
         : payments;
      res.json({
        data: paginatedData,
        pagination: {
          totalRecords,
          totalPages,
          currentPage: page,
          limit
        }
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener pagos" });
    }
};  
const getOrderPayId = async (req, res) => {
    try {
        const payments = await OrderPay.find({ 
            id_owner: String(req.body.id_owner), 
            id_client: String(req.body.id_client),
            orderId: mongoose.Types.ObjectId(req.body.orderId),
        })
        .populate("orderId")
        .populate("sales_id")
        .populate("id_client")
        .lean(); 
        if (payments.length === 0) {
            return res.json([]);
        }
        const orderIds = payments.map(p => p.orderId?._id).filter(Boolean);
        const allPayments = await OrderPay.find({ orderId: { $in: orderIds } }).lean();

        const paymentsWithDebt = payments.map(payment => {
            const orderTotal = payment.orderId?.totalAmount || 0;

            const totalPaid = allPayments
                .filter(p => p.orderId?.toString() === payment.orderId?._id.toString())
                .reduce((sum, p) => sum + (p.total || 0), 0);

            const debt = orderTotal - totalPaid;

            return {
                ...payment,
                totalPaid,
                debt: debt > 0 ? debt : 0 
            };
        });

        res.json(paymentsWithDebt);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener pagos" });
    }
};
const postOrderPay = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

    const newOrderPay = new OrderPay({
      saleImage: imageUrl,
      total: Number(req.body.total),
      note: req.body.note,
      orderId: mongoose.Types.ObjectId(req.body.orderId),
      numberOrden: req.body.numberOrden,
      paymentStatus: req.body.paymentStatus,
      id_client: mongoose.Types.ObjectId(req.body.id_client),
      sales_id: mongoose.Types.ObjectId(req.body.sales_id),
      id_owner: req.body.id_owner,
    });

    const savedOrderPay = await newOrderPay.save();

    const allPays = await OrderPay.find({ orderId: savedOrderPay.orderId });
    const totalPagado = allPays.reduce((acc, pago) => acc + pago.total, 0);

    const order = await Order.findById(savedOrderPay.orderId);

    if (!order) {
      return res.status(404).send({ message: "Orden no encontrada" });
    }

    if (totalPagado >= order.totalAmount) {
      order.payStatus = "Pagado";
      await order.save();
    }

    res.status(200).send({
      saleImage: savedOrderPay.saleImage,
      total: savedOrderPay.total,
      note: savedOrderPay.note,
      orderId: savedOrderPay.orderId,
      numberOrden: savedOrderPay.numberOrden,
      paymentStatus: savedOrderPay.paymentStatus,
      id_client: savedOrderPay.id_client,
      sales_id: savedOrderPay.sales_id,
      id_owner: savedOrderPay.id_owner,
    });
  } catch (e) {
    console.error("Error en postOrderPay:", e);
    res.status(500).send({ message: "Error al guardar la orden de pago" });
  }
};

const getOrderPayByCalendar = async (req, res) => {
  try {
    const page = req.body.page || 1;
    const limit = req.body.limit || 0;
    let filter = { id_owner: String(req.body.id_owner) };
    const pipeline = [];

    if (typeof req.body.month === "number" && typeof req.body.year === "number") {
      const { month, year } = req.body;
      const adjustedMonth = month - 1;

      const startDate = new Date(year, adjustedMonth, 1, 0, 0, 0, 0);
      const endDate = new Date(year, adjustedMonth + 1, 0, 23, 59, 59, 999);

      let endUTC4 = new Date(endDate.getTime() - 4 * 60 * 60 * 1000);
      endUTC4.setDate(endUTC4.getDate() + 1);

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
            creationDateLocal: {
              $gte: startDate,
              $lte: endUTC4,
            },
          },
        }
      );
    } else {
      pipeline.push({ $match: filter });
    }
    if (req.body.status) {
      filter.paymentStatus = req.body.status;
    }
    if (req.body.id_client) {
      filter.id_client = req.body.id_client;
    }

    const allPaymentsRaw = await OrderPay.aggregate(pipeline);
    await Order.populate(allPaymentsRaw, [
      { path: "id_client" },
      { path: "sales_id", model: "SalesMan" },
      { path: "orderId" },
    ]);
    
    let filteredPayments = allPaymentsRaw;
    if (req.body.clientName) {
      const clientNameLower = req.body.clientName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      filteredPayments = allPaymentsRaw.filter((p) => {
        const name = (p.id_client?.name || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        const lastName = (p.id_client?.lastName || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        return name.includes(clientNameLower) || lastName.includes(clientNameLower);
      });
    }

    const totalRecords = filteredPayments.length;
    const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;
    const paginatedPayments =
      limit > 0 ? filteredPayments.slice((page - 1) * limit, page * limit) : filteredPayments;

    const orderIds = paginatedPayments.map((p) => p.orderId?._id).filter(Boolean);
    const allPayments = await OrderPay.find({ orderId: { $in: orderIds } }).lean();

    const paymentsWithDebt = paginatedPayments.map((payment) => {
      const orderTotal = payment.orderId?.totalAmount || 0;
      const totalPaid = allPayments
        .filter((p) => p.orderId?.toString() === payment.orderId?._id.toString())
        .reduce((sum, p) => sum + (p.total || 0), 0);
      const debt = orderTotal - totalPaid;
      return {
        ...payment,
        totalPaid,
        debt: debt > 0 ? debt : 0,
      };
    });

    res.json({
      data: paymentsWithDebt,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pagos" });
  }
};

module.exports = {
    getOrderPay,
    postOrderPay,
    getOrderPayId,
    getOrderPayBySales,
    getOrderPayByCalendar
};
