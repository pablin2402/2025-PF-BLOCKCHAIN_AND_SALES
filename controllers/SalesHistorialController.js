const SalesHistorial = require("../models/SalesHistorial");

const getSalesHistorial = async (req, res) => {
  const salesHistorialList = await SalesHistorial.find({id_owner: req.body.id_owner, id_client: req.body.id_client});
  res.json(salesHistorialList);
};
const getSalesHistorialPerClient = async (req, res) => {
  const salesHistorialList = await SalesHistorial.find({id_owner: req.body.id_owner});
  res.json(salesHistorialList);
};
const postSalesHistorial = (req, res) => {
  try {
   const sales = new SalesHistorial({
    receiveNumber: req.body.receiveNumber,
    name: req.body.name,
    nitNumber: req.body.nitNumber,
    productOrder: req.body.productOrder,
    totalAmount: req.body.totalAmount,
    note: req.body.note,
    accountStatus:req.body.accountStatus,
    dueDate: req.body.dueDate,
    id_owner: req.body.id_owner,
    id_client: req.body.id_client
    });
    sales.save((err,order) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        receiveNumber: sales.receiveNumber,
        creationDate: sales.creationDate,
        name: sales.name,
        nitNumber: sales.nitNumber,
        productOrder: sales.productOrder,
        totalAmount: sales.totalAmount,
        note: sales.note,
        accountStatus: sales.accountStatus,
        dueDate: sales.dueDate,
        id_owner: sales.id_owner,
        id_client: sales.id_client
     
      });
    });
  } catch (e) {
    myConsole.log(e);
 }
};

module.exports = {
    getSalesHistorial,
    getSalesHistorialPerClient,
    postSalesHistorial,
};
