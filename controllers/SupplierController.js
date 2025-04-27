const Supplier = require("../models/Supplier");

const getSupplier = async (req, res) => {
  const supplierList = await Supplier.find({id_owner:String(req.body.id_owner)});
  res.json(supplierList);
};
const postSupplier = (req, res) => {
  try {
   const supplier = new Supplier({
      supplierName: req.body.supplierName,
      id_owner: req.body.id_owner,
    });
    supplier.save((err, category) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        supplierName: supplier.supplierName,
        id_owner: supplier.id_owner,
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};

module.exports = {
    getSupplier,
    postSupplier,
};
