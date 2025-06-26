const SalesMan = require("../models/SalesMan");
const mongoose = require("mongoose");
const getSalesManList1 = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: "Debe enviar un array de IDs" });
    }

    const objectIds = ids.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch {
        return null;
      }
    }).filter(Boolean);

    const salesmen = await SalesMan.find(
      { _id: { $in: objectIds } },
      { fullName: 1, lastName: 1 }
    );

    res.json(salesmen);
  } catch (error) {
    console.error("Error buscando vendedores:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
const postNewAccount = (req, res) => {
  try {
   const client = new SalesMan({
        fullName: req.body.fullName,
        lastName:req.body.lastName,
        email: req.body.email,
        role: req.body.role,
        id_owner: req.body.id_owner,
        phoneNumber: req.body.phoneNumber,
        client_location: req.body.client_location,
        region: req.body.region
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
        role: client.role,
        id_owner: client.id_owner,
        phoneNumber: client.phoneNumber,
        client_location: client.client_location,
        region: client.region
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};
const getSalesMan = async (req, res) => {
  try {
    const { id_owner, page, limit, searchTerm = "" } = req.body;

    const query = { id_owner: String(id_owner) };

    if (searchTerm.trim() !== "") {
      const regex = new RegExp(searchTerm.trim(), "i");
      query.$or = [
        { fullName: { $regex: regex } },
        { lastName: { $regex: regex } }
      ];
    }

    const totalItems = await SalesMan.countDocuments(query);
    const data = await SalesMan.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      data,
      items: totalItems,
      page: Number(page),
      totalPages: Math.ceil(totalItems / Number(limit))
    });
  } catch (error) {
    console.error("Error al obtener vendedores:", error);
    res.status(500).json({ message: "Error al obtener vendedores", error });
  }
};

const getSalesManById = async (req, res) => {
  try {
    const salesMan = await SalesMan.findOne({
      id_owner: String(req.body.id_owner),
      _id: new mongoose.Types.ObjectId(req.body._id)
    }).populate("client_location")
    .populate("userId");;

    if (!salesMan) {
      return res.status(404).json({ message: "Vendedor no encontrado" });
    }

    res.json(salesMan);
  } catch (error) {
    res.status(500).json({ message: "Error en la búsqueda", error });
  }
};
const getClientLocationById = async (req, res) => {
    await SalesMan.find({id_owner:String(req.body.id_owner)}).populate("client_location").then(p=>  res.json(p));
  };
  
module.exports = {
    postNewAccount,
    getSalesMan,
    getClientLocationById,
    getSalesManById,
    getSalesManList1
};
  