const nodemailer = require('nodemailer')
const {google} = require ('googleapis')
const axios = require("axios");
//const { Buffer } = require('buffer');
const MailParser = require('mailparser').MailParser;
var base64 = require('js-base64').Base64;

const CLIENT_ID='714964605525-v5pmhjc84usbtp57bg254rt84bks8mvr.apps.googleusercontent.com'
const CLIENT_SECRET='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'
const REDIRECT_URI='https://developers.google.com/oauthplayground'
const REFRESH_TOKEN='1//040sC40R68YiHCgYIARAAGAQSNwF-L9IrmyL3KRxnZOz-du3jBEkEe6IcU9dZKDk4oZtRL5ieZdspbq49sl6sChvgkSUchspDi0g'

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  
async function sendMail() {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: 'pabloperedo04@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
          },
        });
    
        const mailOptions = {
          from: 'Pablo Rivas <pabloperedo04@gmail.com>',
          to: 'pabloperedo04@gmail.com',
          subject: 'Hello from gmail using API',
          text: 'Hello from gmail email using API',
          html: '<h1>Hello from gmail email using API</h1>',
        };
    
        const result = await transport.sendMail(mailOptions);
        console.log(result)
        return result;
      } catch (error) {
        return error;
      }
}
const generateConfig = (url, accessToken) => {
    return {
      method: "get",
      url: url,
      headers: {
        Authorization: `Bearer ${accessToken} `,
        "Content-type": "application/json",
      },
    };
  };
async function getUser(req, res) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/pabloperedo04@gmail.com/profile`;
        const { token } = await oAuth2Client.getAccessToken();
        const config = generateConfig(url, token);
        const response = await axios(config);
        res.json(response.data);
      } catch (error) {
        console.log(error);
        res.send(error);
      }
}

    async function deleteMessagesById(req, res) {
        try {
            const url = `https://gmail.googleapis.com/gmail/v1/users/pabloperedo04@gmail.com/messages/`+req.body.id+`/trash`;
            const { token } = await oAuth2Client.getAccessToken();
            const config = {
                method: "POST",
                url: url,
                headers: {
                  Authorization: `Bearer ${token} `,
                  "Content-type": "application/json",
                },
            };
            const response = await axios(config);
            res.json(response.data);
          } catch (error) {
            console.log(error);
            return error;
          }
    }
    async function getMessagesById(req, res) {
        try {
            const url = `https://gmail.googleapis.com/gmail/v1/users/pabloperedo04@gmail.com/messages/1888c11909eb7791`;
            const { token } = await oAuth2Client.getAccessToken();
            const config = generateConfig(url, token);
            const response = await axios(config);
            res.json(response.data);
          } catch (error) {
            console.log(error);
            return error;
          }
    }
    async function findMessagesByKeyMessage(req, res) {
        try {
            let pages = 15; 
            const url = `https://gmail.googleapis.com/gmail/v1/users/pabloperedo04@gmail.com/messages?maxResults=${pages}&q=${req.body.q}`;
            const { token } = await oAuth2Client.getAccessToken();
            const config = generateConfig(url, token);
            const response = await axios(config);
            const messages = response.data.messages;
            const fullMessages = await messagesById(messages, token);
            res.json(fullMessages);
        } catch (error) {
            console.log(error);
            return error;
        }
    }
    async function getDrafts(req, res) {
        try {
            const url = `https://gmail.googleapis.com/gmail/v1/users/pabloperedo04@gmail.com/messages?maxResults=`+10;
            const { token } = await oAuth2Client.getAccessToken();
            const config = generateConfig(url, token);
            const response = await axios(config);
            const messages = response.data.messages;
            const fullMessages = await messagesById(messages, token);
            res.json(fullMessages);
          } catch (error) {
            console.log(error);
            res.send(error);
          }
        }
        //Obtiene los contactos con sus subject
    async function messagesById(messages, token) {
        return await Promise.all(
            messages.map(async (message) => {
                const messageId = message.id;
                const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/pabloperedo04@gmail.com/messages/${messageId}`;
                const messageConfig = {
                    method: 'GET',
                    url: messageUrl,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const messageResponse = await axios(messageConfig);
                const draftData = {
                    id: messageResponse.data.id,
                    msg: messageResponse.data.snippet,
                    headers: [],
                    imageLink: null,
                    attachments: [], 

                };
                Array.from(messageResponse.data.payload.headers).forEach((message) => {
                    if (message.name == "Date" || message.name == "Subject" || message.name == "From") {
                        draftData.headers.push({ name: message.name, value: message.value, id: messageResponse.data.id });
                    }
                });
                /*
                const attachment = getAttachment(messageResponse.data.payload.parts);
                if (attachment) {
                  try {
                    const attachmentId = attachment.body.attachmentId;
                    const attachmentUrl = `https://www.googleapis.com/gmail/v1/users/pabloperedo04@gmail.com/messages/${messageId}/attachments/${attachmentId}`;
                    const attachmentConfig = {
                      method: 'GET',
                      url: attachmentUrl,
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      responseType: 'arraybuffer',
                    };
                    const attachmentResponse = await axios(attachmentConfig);

                    const base64Image = Buffer.from(attachmentResponse.data, 'binary').toString('base64');

                    draftData.attachments.push({
                      filename: attachment.filename,
                      mimeType: attachment.mimeType,
                      data: base64Image,
                    });

                    console.log(`Imagen adjunta obtenida: ${attachment.filename}`);
                  } catch (error) {
                    console.error('Error al obtener la imagen adjunta:', error);
                  }
                }
*/
                return draftData;
            })
        );
    }
    function getAttachment(parts) {
      for (const part of parts) {
        if (part.filename && part.mimeType.startsWith('image/')) {
          return part;
        } else if (part.parts) {
          const attachment = getAttachment(part.parts);
          if (attachment) {
            return attachment;
          }
        }
      }
    }
    //Obtiene el cuerpo del mensaje
    async function getBodyMessage(req, res) {
        const url = `https://gmail.googleapis.com/gmail/v1/users/pabloperedo04@gmail.com/messages/`+req.body.id;
        const { token } = await oAuth2Client.getAccessToken();
        const config = generateConfig(url, token);
      
        try {
            const response = await axios(config);
      
          if (response.status === 200) {
            const message = response.data;
            const bodyPart = findBodyPart(message.payload.parts);
      
            if (bodyPart) {
              const bodyData = bodyPart.body.data;
              const decodedBody = decodeBase64Url(bodyData);
      
              const mailParser = new MailParser();
              mailParser.on('end', (parsedMessage) => {
                const cuerpo = parsedMessage.text || parsedMessage.html;
                res.send({ message: cuerpo });
                console.log(cuerpo)
              });
              res.send({ message: decodedBody });

              mailParser.write(decodedBody);
              mailParser.end();
            } else {
              console.error('No se encontró una parte de cuerpo de texto plano en el mensaje.');
              res.send({ message: 'No se encontró contenido de texto en el mensaje.' });
            }
          } else {
            console.error('Error al obtener el mensaje:', response.status);
            res.send({ message: 'Error al obtener el mensaje.' });
          }
        } catch (error) {
          console.error('Error al realizar la solicitud:', error.message);
          res.send({ message: 'Error al realizar la solicitud.' });
        }
      }

      function findBodyPart(parts) {
        for (const part of parts) {
          if (part.mimeType === 'text/plain') {
            return part;
          } else if (part.parts) {
            const bodyPart = findBodyPart(part.parts);
            if (bodyPart) {
              return bodyPart;
            }
          }
        }
        return null;
      }
      /*
      function decodeBase64Url(base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        //const decodedData = Buffer.from(base64, 'base64').toString('utf-8');
        return decodedData;
      }*/

module.exports = {
  getUser,
  sendMail,
  getDrafts,
  getMessagesById,
  deleteMessagesById,
  findMessagesByKeyMessage,
  messagesById,
  getBodyMessage
};