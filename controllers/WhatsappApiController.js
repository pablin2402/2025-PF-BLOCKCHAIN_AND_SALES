const qrcode = require('qrcode');
const { Client } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const client = new Client();

client.on('qr', async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);    
    io.emit('qr', qrImage);
});

client.on('ready', () => {
});

client.initialize();

server.listen(3000, () => {
});
