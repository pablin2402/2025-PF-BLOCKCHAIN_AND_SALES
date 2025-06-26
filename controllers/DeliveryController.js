const Delivery = require("../models/Delivery");
const mongoose = require("mongoose");

const postNewDelivery = (req, res) => {
  try {
   const client = new Delivery({
        fullName: req.body.fullName,
        lastName:req.body.lastName,
        email: req.body.email,
        identificationNumber: req.body.identificationNumber,
        phoneNumber: req.body.phoneNumber,
        active: true,
        region: req.body.region,
        id_owner: req.body.id_owner,
        client_location:  new mongoose.Types.ObjectId(req.body.client_location),
        userId:  new mongoose.Types.ObjectId(req.body.userId)
    });
    client.save((err,client) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200, 204).send({
        fullName: client.fullName,
        lastName:client.lastName,
        email: client.email,
        id_owner: client.id_owner,
        phoneNumber: client.phoneNumber,
        userId: client.userId,
        identificationNumber: client.identificationNumber,
        client_location: client.client_location
      });
    });
  } catch (e) {
  }
};
const getDelivery = async (req, res) => {
    try {
      const { id_owner, page, limit, searchTerm} = req.body;
  
      const matchStage = {
        id_owner: String(id_owner)
      };
  
      const aggregatePipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId"
          }
        },
        {
            $unwind: {
              path: "$userId",
              preserveNullAndEmptyArrays: true
            }
          }
              ];
  
      if (searchTerm && searchTerm.trim() !== "") {
        const searchRegex = new RegExp(searchTerm.trim(), "i");
        aggregatePipeline.push({
          $match: {
            $or: [
              { "userId.fullName": { $regex: searchRegex } },
              { "userId.lastName": { $regex: searchRegex } }
            ]
          }
        });
      }
      
  
      aggregatePipeline.push(
        {
          $lookup: {
            from: "clientlocations",
            localField: "client_location",
            foreignField: "_id",
            as: "client_location"
          }
        },
        {
          $unwind: {
            path: "$client_location",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $facet: {
            metadata: [
              { $count: "total" },
              {
                $addFields: {
                  page: Number(page),
                  limit: Number(limit)
                }
              }
            ],
            data: [
              { $skip: (Number(page) - 1) * Number(limit) },
              { $limit: Number(limit) }
            ]
          }
        }
      );
  
      const result = await Delivery.aggregate(aggregatePipeline);
  
      const metadata = result[0].metadata[0] || { total: 0, page: Number(page), limit: Number(limit) };
      const deliveries = result[0].data;
  
      res.json({
        data: deliveries,
        items: metadata.total,
        page: metadata.page,
        totalPages: Math.ceil(metadata.total / metadata.limit)
      });
    } catch (error) {
      console.error("Error al obtener entregas:", error);
      res.status(500).json({ message: "Error al obtener entregas", error });
    }
  };
  
const getDeliveryById = async (req, res) => {
  try {
    const salesMan = await Delivery.findOne({
      id_owner: String(req.body.id_owner),
      userId: new mongoose.Types.ObjectId(req.body._id)
    })
    .populate("client_location")
    .populate("userId");
    if (!salesMan) {
      return res.status(404).json({ message: "Vendedor no encontrado" });
    }
    res.json(salesMan);
  } catch (error) {
    res.status(500).json({ message: "Error en la búsqueda", error });
  }
};
const getDeliveryLocation = async (req, res) => {
    await Delivery.find({id_owner:String(req.body.id_owner)}).populate("client_location").then(p=>  res.json(p));
  };
  
module.exports = {
    postNewDelivery,
    getDelivery,
    getDeliveryById,
    getDeliveryLocation
};
  