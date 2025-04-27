const User = require("../models/User");
const ClientLocation = require("../models/ClientLocation");

const getClientLocationById = async (req, res) => {
  console.log(req.body);
  const { id_owner, userCategory, salesFullName = [], salesLastName = [] } = req.body;

  let query = { id_owner: String(id_owner) };
  if (Array.isArray(userCategory) && userCategory.length > 0) {
    query.userCategory = { $in: userCategory };
  }

  try {
    let users = await User.find(query)
      .populate("client_location")
      .populate("sales_id");

    if (salesFullName.length > 0 || salesLastName.length > 0) {
      users = users.filter((user) => {
        const matchFull = salesFullName.includes(user.sales_id?.fullName);
        const matchLast = salesLastName.includes(user.sales_id?.lastName);
        return matchFull && matchLast;
      });
    }

    res.json(users);
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
  getClientLocationById,postClientLocation,getClientInfoById
};
