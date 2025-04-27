const Quotation = require("../models/Quotation");

const getQuotation = async (req, res) => {
  const quotList = await Quotation.find();
  res.json(quotList);
};
const postQuotation = (req, res) => {
  try {
   const quotation = new Quotation({
    quotationName: req.body.quotationName,
    totalAmount:req.body.totalAmount ,
    receiveNumber:req.body.receiveNumber,
    noteAditional: req.body.noteAditional,
    color: req.body.color,
    userId: req.body.userId,
    tasks: req.body.tasks,
    });
    quotation.save((err) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
    });
    res.send("EVENT_RECEIVED");
  } catch (e) {
    myConsole.log(e);
    res.send("EVENT_RECEIVED");
  }
};

module.exports = {
    getQuotation,
    postQuotation,
};
