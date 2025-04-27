const express = require("express");
const morgan = require('morgan');
const { Client, LocalAuth } = require('whatsapp-web.js');

const qrcode = require('qrcode-terminal');

const apiRoute = require("./routes/routes");
const inventaryRoute = require("./routes/inventary.route");
const userRoute = require("./routes/client.route");
const kanbanRoute = require("./routes/kanban.route");
const pdfController = require("./controllers/pdfController")
const triggerController = require("./controllers/TriggerController")

const {Server} = require("socket.io");

const cors = require('cors');
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');

const http = require("http");
const io = require("socket.io");

const { store } = require('./database');
const { profile } = require("console");

//Initialize
require('./database');
const app = express();
require("dotenv").config();
const allSessionsObject  ={};
const sessionClients = {};

const createWhatsAppSession = (id,socket) =>{
  const client = new Client({
    webVersionCache: { type: 'remote', 
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html',
  },
    puppeteer: {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
    },
    
    authStrategy: new LocalAuth({
      clientId: id,
    }),
 
  });
  client.on('qr', (qr) => {
    socket.emit("qr",{
      qr,
      message:"you did it"
    });
  });
  client.on('message', async (message) => {
    console.log("mensaje", message);
    const allChats = await client.getChats();
    const chatsWithProfileImages = await Promise.all(allChats.map(async (chat) => {
      const contact = await client.getProfilePicUrl(chat.id._serialized);
      chat.profileImage = contact;
      return chat;
    }));

    //socket.emit("loadChats", { allChats: chatsWithProfileImages });
  });
  client.on("authenticated", () => {
    console.log("authenticated");
    socket.emit("authenticated",{message:"you did it"})

  });
  client.on("ready", () => {
    allSessionsObject[id] =client;
    socket.emit("ready",{id,message:"you did it"})
    console.log(id, client)
  });
  client.on('remote_session_saved', (qr) => {
    qrcode.generate(qr, {small: true});
      console.log('QR RECEIVED', qr);
  });
  client.initialize();

  const sendMessage = async (req, res) => {
    try {
      const chatId = req.body.chatId;
      const message = req.body.message;

      const chat = await client.getChatById(chatId);
      const sentMessage = await chat.sendMessage(message);
      console.log('Message sent successfully:', sentMessage.body);
      client.destroy();
      res.status(200).send({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).send({ message: 'Error sending message' });
    }
  };
  module.exports = {
    sendMessage
  };
  
  
};
const getWhatsappSession = (id, socket) =>{
  const client = new Client({
    webVersionCache: {
      type: "remote",
      remotePath:
        "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
    puppeteer:{
      headless: false,
    },
    authStrategy: new LocalAuth({
      clientId: id,
    }),
    });
    client.on('ready', () => {
      console.log('Client is ready!');
      socket.emit("ready",{ qr,});
      client.on('qr', (qr) => {
        socket.emit("qr",{
          qr,
          message:"you did it"
        });
    });
  })
}
const httpServer = http.createServer(app);
const socketIO = new Server(httpServer, {
  cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"],
    },
});

socketIO.on("connection", (socket) => {
  
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
    socket.on("connected", (data) => {
      socket.emit("hello", "hello from the serve");
    });
    socket.on("createSession", (data) => {
      console.log('data', data);
      const {id} = data;
      createWhatsAppSession(id, socket)
    });
    socket.on("getContacts", (data) => {
      console.log('data', data);
      const {id} = data;
      createWhatsAppSession(id, socket)
    });
    socket.on("getSession", (data) => {
      console.log('data', data);
      const {id} = data;
      getWhatsappSession(id, socket);
    });
    socket.on("getAllChats", async (data) => {
      const id = "caca";
     // console.log(id, "hola")
      const client = allSessionsObject[id];
      console.log(client)
      const allChats = await client.getChats();
      const chatsWithProfileImages = await Promise.all(allChats.map(async (chat) => {
        const contact = await client.getProfilePicUrl(chat.id._serialized);
        chat.profileImage = contact;
        return chat;
      }));
      socket.emit("allChats",{
        allChats: chatsWithProfileImages
      });
    });  
    async function getMediaUrlFromMessage(message) {
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        return media;
      }
      return null;
    }
    socket.on("getChatsById", async (data) => {
      const id = "caca";
      const chatId = data.chatId;
     // console.log(id, chatId)
      const client = allSessionsObject[id];
      const chat = await client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit: 50 }); 
      const processedMessages = await Promise.all(messages.map(async message => {
        if (message.type === 'image' && message.hasMedia) {
         // const media = await message.downloadMedia();
          const mediaUrl = await getMediaUrlFromMessage(message); // Función que genera la URL
          return {
            ...message,
            mediaKey: mediaUrl
          };
        }
        if (message.type === 'document' && message.hasMedia) {
          // const media = await message.downloadMedia();
           const mediaUrl = await getMediaUrlFromMessage(message); // Función que genera la URL
           return {
             ...message,
             mediaKey: mediaUrl
           };
         }
         if (message.type === 'ptt' && message.hasMedia) {
          // const media = await message.downloadMedia();
           const mediaUrl = await getMediaUrlFromMessage(message); // Función que genera la URL
           return {
             ...message,
             mediaKey: mediaUrl
           };
         }
        return message;
      }));
    
      //console.log("mensajes", processedMessages)
      socket.emit("allChatsById",{
        allChats: processedMessages,

      });
    });
    socket.on("sendMessage", async (data) => {
      const { id, chatId, chat } = data;
      //sessionClients[id] = client;
      console.log("Hola aaaaaa",id, chatId, chat)
      const client = allSessionsObject["caca"];
      if (!client) {
        console.error(`WhatsApp session with id ${id} does not exist`);
        return;
      }
      try {
          const chatObject = await client.getChatById(chatId);
          await chatObject.sendMessage(chat);
          console.log('Message sent successfully:', chat);        
          socket.emit("messageSent", { message: 'Message sent successfully' });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit("messageError", { message: 'Error sending message' });
      }
    });
       
});
const PORT = process.env.PORT || 3050;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.set('Port', 3023);
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.json());
app.use(cors());
app.use("/whatsapp", triggerController);
app.use("/whatsapp", pdfController);
app.use("/whatsapp", apiRoute);
app.use("/whatsapp", inventaryRoute);
app.use("/whatsapp", userRoute);
app.use("/whatsapp", kanbanRoute);
const ip = '172.20.10.14';
//192.168.1.87
//192.168.0.104
const port = process.env.PORT || 3040;
app.listen(port,ip, () => {
    console.log(`server on port 3023 `);
});

