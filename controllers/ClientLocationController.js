const User = require("../models/User");
const ClientLocation = require("../models/ClientLocation");
const mongoose = require("mongoose");


const getClientLocationById = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    nameClient
  } = req.body;

  const skip = (page - 1) * limit;

  try {
    const query = { id_owner: String(req.body.id_owner) };

    if ( req.body.salesCategory && mongoose.Types.ObjectId.isValid(req.body.salesCategory)) {
      query.sales_id = new mongoose.Types.ObjectId( req.body.salesCategory);
    }
    if ( req.body.userCategory ) {
      query.userCategory = req.body.userCategory;
    }
    if (nameClient && nameClient.trim() !== "") {
      query.$or = [
        { name: { $regex: nameClient, $options: "i" } },
        { lastName: { $regex: nameClient, $options: "i" } }
      ];
    }
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate("client_location")
      .populate("sales_id")
      .skip(skip)
      .limit(parseInt(limit));
    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes", error });
  }
};
const getClientLocationByIdAndSales = async (req, res) => {
  try {
    const query = { id_owner: String(req.body.id_owner) };

    if (req.body.sales_id && mongoose.Types.ObjectId.isValid(req.body.sales_id)) {
      query.sales_id = new mongoose.Types.ObjectId(req.body.sales_id);
    }

    const nameClient = req.body.nameClient;
    if (nameClient && nameClient.trim() !== "") {
      query.$or = [
        { name: { $regex: nameClient, $options: "i" } },
        { lastName: { $regex: nameClient, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .populate("client_location")
      .populate("sales_id");

    res.json({
      total: users.length,
      users,
    });

  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes", error });
  }
};


const getClientInfoById = async (req, res) => {
  await User.find({_id:String(req.body._id)})
  .populate("client_location")
  .then(p=>  res.json(p));
};
const postClientLocation = (req, res) => {
    try {
     const clientLocation = new ClientLocation({
      
        sucursalName: req.body.sucursalName,
        longitud: req.body.longitud,
        latitud: req.body.latitud,
        iconType: req.body.iconType,
        logoColor: req.body.logoColor,
        active: req.body.active,
        client_id:req.body.client_id,
        id_owner:req.body.id_owner,
        direction:req.body.direction,
        houseNumber: req.body.houseNumber,
        city: req.body.city

      });
      clientLocation.save((err,location) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        res.status(200).send({
            _id: location._id,
            sucursalName:location.sucursalName,
            longitud: location.longitud,
            latitud: location.latitud,
            iconType:location.iconType,
            logoColor:location.logoColor,
            active:location.active,
            client_id:location.client_id,
            id_owner:location.id_owner
        });
      });
    } catch (e) {
      myConsole.log(e);
    }
  };

module.exports = {
  getClientLocationById,postClientLocation,getClientInfoById,getClientLocationByIdAndSales
};
