const Automatization = require("../models/Automatization");
const AutomatizationList = require("../models/AutomatizationList");
const { auto } = require("../my-synonyms-library/data");

const getAutomatization = async (req, res) => {
  const automatizationList = await Automatization.find({id_user:String(req.body.id_user)});
  res.json(automatizationList);
};
const postAutomatization = (req, res) => {
  try {
   const automatization = new Automatization({
        title: req.body.automatization,
        id_user: req.body.id_user,
        id_owner: req.body.id_owner,
        type: req.body.type,
        dailyHour: req.body.dailyHour,
        messageToSend: req.body.messageToSend,
        isEmail: req.body.isEmail,
        isPhone: req.body.isPhone
    });
    automatization.save((err, automatization) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        title: automatization.title,
        id_user: automatization.id_user,
        id_owner: automatization.id_owner,
        type: automatization.type,
        dailyHour: automatization.dailyHour,
        messageToSend: automatization.messageToSend,
        isPhone: automatization.isPhone,
        isEmail: automatization.isEmail
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};

const getAutomatizationList = async (req, res) => {
  const automatizationList = await AutomatizationList.find({id_user:String(req.body.id_user)});
  res.json(automatizationList);
};
const postAutomatizationList = (req, res) => {
  try {
   const automatization = new AutomatizationList({
        title: req.body.title,
        id_user: req.body.id_user,
        id_owner: req.body.id_owner,
        type: req.body.type,
        dailyHour: req.body.dailyHour,
        messageToSend: req.body.messageToSend,
        isEmail: req.body.isEmail,
        isPhone: req.body.isPhone,
        status: req.body.status,
        emailHtml: req.body.emailHtml,
        people: req.body.people,
        numberDate: req.body.numberDate,
        dailySentStatus: req.body.dailySentStatus,
        weeklysentStatus: req.body.weeklysentStatus,
        yearsentStatus:req.body.yearsentStatus,
        lastMonthlySent: req.body.lastMonthlySent,
        lastWeeklySent: req.body.lastWeeklySent
    });
    automatization.save((err, automatization) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        title: automatization.title,
        id_user: automatization.id_user,
        id_owner: automatization.id_owner,
        type: automatization.type,
        dailyHour: automatization.dailyHour,
        messageToSend: automatization.messageToSend,
        isPhone: automatization.isPhone,
        isEmail: automatization.isEmail,
        status: automatization.status,
        emailHtml: automatization.emailHtml,
        people: automatization.people,
        numberDate: automatization.numberDate,
        dailySentStatus:automatization.dailySentStatus,
        weeklysentStatus: automatization.weeklysentStatus,
        yearsentStatus: automatization.yearsentStatus,
        lastMonthlySent: automatization.lastMonthlySent,
        lastWeeklySent: automatization.lastWeeklySent
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};

const uploadAutomatizationStatus = async (req, res) => {
  const { id_user, status, id_owner, _id } = req.body;
  
    try {
      const automatization = await AutomatizationList.findOneAndUpdate(
        { id_user: id_user, id_owner: id_owner, _id:_id},
        { status: status },
        { new: true }
      );
  
      if (!automatization) {
        return res.status(404).json({ error: 'No se encontró la automatization con los parámetros proporcionados' });
      }
  
      return res.json({ automatization });
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      res.status(500).json({ error: 'Error al actualizar el estadoxx' });
    }
}
module.exports = {
    getAutomatization,
    postAutomatization,
    getAutomatizationList,
    postAutomatizationList,
    uploadAutomatizationStatus
};
