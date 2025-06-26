const AnswerMessage = require("../models/AnswerMessage");

const getAnswerById = async (req, res) => {
    await AnswerMessage.find({id_owner:String(req.body.id_owner)}).then(p=>  res.json(p));
};
const deleteAnswer = async (req, res) => {
  const product_id = req.body.id_owner;
  const id_client = req.body.id_client;

  const deleteProduct = await AnswerMessage.deleteOne({ id_owner: product_id, id_client: id_client });

  if (deleteProduct.deletedCount === 0) {
    return res.status(404).json({ error: 'Respuesta no encontrado' });
  }
  return res.status(200).json({ message: 'Respuesta eliminado correctamente' });
};
const uploadProductStatus = async (req, res) => {
  const { id_user, status, productId } = req.body;
  
    try {
      const product = await Product.findOneAndUpdate(
        { id_user: id_user, productId: productId },
        { status: status },
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
}
const postAnswer = (req, res) => {
  try {
   const message = new AnswerMessage({
      fullMessage : req.body.fullMessage,
      answerName: req.body.answerName,
      type: req.body.type,
      id_client:req.body.id_client,
      id_owner: req.body.id_owner,
      message_type: req.body.message_type
    });
    message.save((err,message) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        fullMessage: message.fullMessage,
        answerName: message.answerName,
        type: message.type,
        id_client: message.id_client,
        id_owner: message.id_owner,
        message_type: message.message_type
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};

module.exports = {
  getAnswerById,postAnswer, uploadProductStatus, deleteAnswer
};
