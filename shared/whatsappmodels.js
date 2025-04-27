function MessageText(textResponse, number){
    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": number,    
        "text": {
            "preview_url": true,
            "body": textResponse
        },
        "type": "text"
    });
    return data;
}
function SampleDocument(number, pdf){
    const pdfUrl = pdf.replace(/\/file\/d\/(.*)\/.*$/, "/uc?export=download&id=$1");

    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": number,
        "type": "document",  
        "document": {
            "link": pdfUrl
        }        
    });
    return data;
}
function SampleImage(number,image){
    const data = JSON.stringify({
        "recipient_type": "individual",
        "messaging_product": "whatsapp",
        "to": number,
        "type": "image",  
        "image": {
            "link": image
        }        
    });
    return data;
}

function MessageList(number, body, footer, savedTemplateMessage){
    const centroDeAtencionSection = {
        "title": footer,
        "rows": savedTemplateMessage.action.map(action => ({
          "id": action.id,
          "title": action.keyword,
          "description": action.subtitle
        }))
      };
    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "body": {
                "text": body
            },
            "footer": {
                "text": footer
            },
            "action": {
                "button": body,
                "sections": [centroDeAtencionSection]
              }
        }
    });
    return data;
}
function MessageComprar(number){
    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": number,
        "type": "interactive",  
        "interactive": {
            "type": "button",
            "body": {
                "text": "Selecciona uno de los productos"
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": "option-laptop",
                            "title": "Laptop"
                        }
                    },
                    {
                        "type": "reply",
                        "reply": {
                            "id": "option-computadora",
                            "title": "Computadora"
                        }
                    }
                ]
            }
        }     
    });
    return data;
}
function MessageLocation(number){
    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": number,
        "type": "location",
        "location": {
        "latitude": "-12.067158831865067",
        "longitude": "-77.03377940839486",
        "name": "Estadio Nacional del Perú",
        "address": "C. José Díaz s/n, Cercado de Lima 15046"
    }
        
    });
    return data;
}


module.exports = {
MessageText,
MessageList,
MessageComprar,
MessageLocation,
SampleDocument,
SampleImage
};