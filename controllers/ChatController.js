const ChatController = require("../models/Chat");

const getAnswerById = async (req, res) => {
    await AnswerMessage.find({id_owner:String(req.body.id_owner)}).then(p=>  res.json(p));
};
const postChat = (req, res) => {
  try {
   const message = new ChatController({
        lastMessage: req.body.lastMessage,
        date: req.body.date,
        read: req.body.read,
        type: req.body.type,
        id_client: req.body.id_client
    });
    message.save((err,message) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        lastMessage: message.lastMessage,
        date: message.date,
        read: message.read,
        type: message.type,
        id_client: message.id_client,
        creationDate: message.creationDate
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};
const updateChat = async (req, res) => {
    const { lastMessage,date,read,type,_id } = req.body;
    console.log(req.body._id)
    try {
      const product = await ChatController.findOneAndUpdate(
        { _id },
        { lastMessage: lastMessage, date: date, read: read, type: type },
        { new: true }
      );
  
      if (!product) {
        return res.status(404).json({ error: 'No se encontró el product con los parámetros proporcionados' });
      }
  
      return res.json({ product });
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      res.status(500).json({ error: 'Error al actualizar el estadoxx' });
    }
  };
module.exports = {
    getAnswerById,
    postChat,
    updateChat
};

