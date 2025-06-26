const fs = require("fs");
const myConsole = new console.Console(fs.createWriteStream("./sasd.txt"));
const whatsappService = require("../services/whatsappService");
const samples = require("../shared/sampleModels");
const processMessage = require("../shared/processMessage");
const whatsappModel = require("../shared/whatsappmodels");
const Message = require("../models/Message");
const VerifyToken = (req, res) => {
  try {
    var accessToken = "RTQWWTVHBDEJHJKIKIKNDS9090DS";
    var token = req.query["hub.verify_token"];
    var challenge = req.query["hub.challenge"];

    if (challenge != null && token != null && token == accessToken) {
      res.send(challenge);
    } else {
      res.status(400).send();
    }
  } catch (e) {
    res.status(400).send();
  }
};
const ReceivedMessage = (req, res) => {
  try {
    var entry = req.body["entry"][0];
    var changes = entry["changes"][0];
    var value = changes["value"];
    var messageObject = value["messages"];
    if (typeof messageObject != "undefined") 
    {
      var messages = messageObject[0];
      var number = messages["from"];
      var text = GetTextUser(messages);
      if (text != "") 
      {
        processMessage.Process(text, number);
      }
    }
  } catch (e) { 
    res.send("EVENT_RECEIVED");
  }
};
const getList = async (req, res) => {
  const Messages = await Message.find();
  res.json(Messages);
};
const SendMessageTemplate = (req, res) => {
  var data = whatsappService.getTemplatedMessageInput(59169501045, req.body.listOfProducts, req.body.listOfProducts.qty);
  whatsappService.SendMessageWhatsApp1(data);
};
const updateTypeList = async (req,res) => {
  try {
    const message = await Message.findOne({id_message:req.body.id_message});
    if(message){
      message.typeList.push(req.body);

      await message.save((err,message) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        res.status(200).send({
          fullMessage: message.fullMessage,
          recipientNumber: message.recipientNumber,
          type: message.type,
          number: message.number,
          id_client: message.id_client,
          id_message: message.id_message,
          message_type: message.message_type,
          from: message.from,
          link : message.link,
          date: message.date,
          typeList: message.typeList
        });
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
const SendMessage = async (req, res) => {
  async function saveMessage(req) {
    const timestamp = Date.now(); 
    const isUnixSeconds = timestamp.toString().length === 10; 
    const timestampMillis = isUnixSeconds ? timestamp * 1000 : timestamp;
       try {
          const message = new Message({
            body: req.body.body,
            from: req.body.from,
            fromMe: req.body.fromMe,
            hasMedia: req.body.hasMedia,
            to: req.body.to,
            id_client: req.body.id_client,
            id_message : req.body.id_message,
            type: req.body.type,
            link: req.body.link,
            typeList: req.body.typeList,
            mediaKey: req.body.mediaKey,
            timestamp: timestampMillis 
          });
          await message.save();
          res.status(200).send({
            body: message.body,
            from: message.from,
            fromMe: message.fromMe,
            hasMedia: message.hasMedia,
            to: message.to,
            id_client: message.id_client,
            id_message : message.id_message,
            type: message.type,
            link: message.link,
            typeList: message.typeList,
            mediaKey: message.mediaKey,
            timestamp: message.timestamp
          });
        } catch (error) {
          res.status(500).send({ message: error.message });
        }
  }
  if(req.body.type === "message"){
    await saveMessage(req);  
  }else if (req.body.type === "document"){
    await saveMessage(req);
  }else if (req.body.message_type === "image"){
    await saveMessage(req);
  }else if (req.body.type === "Note"){
    await saveMessage(req);  
  }
}
function GetTextUser(messages) {
  var text = "";
  var typeMessge = messages["type"];
  if (typeMessge == "text") {
    text = messages["text"]["body"];
  } else if (typeMessge == "interactive") {
    var interactiveObject = messages["interactive"];
    var typeInteractive = interactiveObject["type"];

    if (typeInteractive == "button_reply") {
      text = interactiveObject["button_reply"]["title"];
    } else if (typeInteractive == "list_reply") {
      text = interactiveObject["list_reply"]["title"];
    } else {
      myConsole.log("sin mensaje");
    }
  } else {
    myConsole.log("sin mensaje");
  }
  return text;
};
const deleteMessage = async (req,res) => {
  try {
    await Message.findByIdAndRemove(req.body.id);
    res.status(200).send({ message: 'Message deleted successfully' });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  deleteMessage,
  VerifyToken,
  ReceivedMessage,
  SendMessage,
  getList,
  SendMessageTemplate,
  updateTypeList
  
};
