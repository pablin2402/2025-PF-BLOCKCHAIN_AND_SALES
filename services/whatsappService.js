const fs = require("fs");
const https = require("https");
const ClientInfo = require("../models/ClientInfo");
const getClientInfo = async (number) => {
  return await ClientInfo.find({ number: number });
};

async function SendMessageWhatsApp1(data, number){
    const token = await getClientInfo(number);
    const options = {
        host: "graph.facebook.com",
        path: "/v17.0/108092808842052/messages",
        method: "POST",
        body: data,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer EAAMaY0K534YBOzYdwvIoHYWQhbjyqwJkBveTPZCsDCl4M02MxHZBJxwU1NHaqoU1NBYqvY4v5gJn7pMrk8mSfuMc01ZAUaZAUZCkunikIXaaxGQKZCZBOb0ypZCnZAFZCzTRatUuG0ElwSQ33ErWsw5I2MgzKA9YUcZBRq39haNjlV6inTPLbpdYZAYoywX4S3fg9XLlSKyTLZBSOanhebZCBRvZCwZD"
        }
    };
    const req = https.request(options, res => {
        res.on("data", d=> {
            process.stdout.write(d);
        });
    });

    req.on("error", error => {
        console.error(error);
    });

    req.write(data);
    req.end();
}
function SendMessageWhatsApp(number, textResponse){
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "to": number,
    "text": {
      "body": textResponse
    },
    "type":"text"
  })
  
    const options = {
        host: "graph.facebook.com",
        path: "/v17.0/108092808842052/messages",
        method: "POST",
        body: data,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer EAAMaY0K534YBOzYdwvIoHYWQhbjyqwJkBveTPZCsDCl4M02MxHZBJxwU1NHaqoU1NBYqvY4v5gJn7pMrk8mSfuMc01ZAUaZAUZCkunikIXaaxGQKZCZBOb0ypZCnZAFZCzTRatUuG0ElwSQ33ErWsw5I2MgzKA9YUcZBRq39haNjlV6inTPLbpdYZAYoywX4S3fg9XLlSKyTLZBSOanhebZCBRvZCwZD"
        }
    };
    const req = https.request(options, res => {
        res.on("data", d=> {
            process.stdout.write(d);
        });
    });

    req.on("error", error => {
        console.error(error);
    });

    req.write(data);
    req.end();
}
function getTemplatedMessageInput(recipient, movie, seats) {
    const data = JSON.stringify({
      "messaging_product": "whatsapp",
      "to": recipient,
      "type": "template",
      "template": {
        "name": "sample_movie_ticket_confirmation",
        "language": {
          "code": "en_US"
        },
        "components": [
          {
            "type": "header",
            "parameters": [
              {
                "type": "image",
                "image": {
                  "link": movie.productImage
                }
              }
            ]
          },
          {
            "type": "body",
            "parameters": [
              {
                "type": "text",
                "text": movie.productName
              },
              {
                "type": "text",
                "text": movie.productName
              },
              {
                "type": "text",
                "text": price.priceId.price
              },
              {
                "type": "text",
                "text": seats
              }
            ]
          }
        ]
      }
    }
    );
    return data;

  }
module.exports = {
    SendMessageWhatsApp, SendMessageWhatsApp1, getTemplatedMessageInput
};