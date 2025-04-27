const ChatNote = require("../models/ChatNote");

const getNote = async (req, res) => {
  const noteList = await ChatNote.find(
  {
        id_user: req.body.id_user, 
        number: req.body.number
  });
  res.json(noteList);
};
const postNote = (req, res) => {
  try {
   const note = new ChatNote({
      title: req.body.title,
      id_user: req.body.id_user,
      image: req.body.image,
      icon: req.body.icon,
      number: req.body.number,
      userName: req.body.userName,
      message_type: req.body.message_type
    });
    note.save((err, category) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        title: category.title,
        id_user: category.id_user,
        image: category.image,
        icon: category.icon, 
        number: req.body.number,
        userName: req.body.userName,
        message_type: req.body.message_type
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};

module.exports = {
    getNote,
    postNote,
};
