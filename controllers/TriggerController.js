const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const cron = require('node-cron');
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client('714964605525-v5pmhjc84usbtp57bg254rt84bks8mvr.apps.googleusercontent.com');
const nodemailer = require('nodemailer');
const AutomatizationList = require("../models/AutomatizationList");

  const disparadorSchema = new mongoose.Schema({
    currentDate:  { type: Date, default: Date.now },
    dailyHour: String,
    messageToSent: String,
    id_owner: String,
    id_kanban: String,
    triggerStatus: { type: Boolean, require: true },
    dailysentStatus: { type: Boolean, require: true },
  });
  const Disparador = mongoose.model('Disparador', disparadorSchema);

  function getWeek(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  }
  async function iniciarDisparadoresProgramados() {
    while (true) {
      try {
        const triggers = await AutomatizationList.find();
        triggers.forEach((trigger) => {
          const {lastWeeklySent, dailyHour, messageToSend, status, dailySentStatus, weeklysentStatus } = trigger;
          const currentHour = new Date().getHours();
          const currentMinutes = new Date().getMinutes();
          const scheduledHour = new Date(dailyHour).getHours();
          const scheduledMinutes = new Date(dailyHour).getMinutes();
          const currentDay = new Date().getDay();
          const currentWeek = getWeek(new Date());

          const scheduledWeeklyDate = new Date(lastWeeklySent);
          const scheduledDailyDate = new Date(lastWeeklySent);
    
          scheduledWeeklyDate.setDate(scheduledWeeklyDate.getDate() + 7);

          if (currentHour === parseInt(scheduledHour, 10) && 
              currentMinutes === parseInt(scheduledMinutes, 10) && 
              status === true && 
              dailySentStatus === true) {
          }
          if (currentDay === scheduledWeeklyDate.getDay() && 
              currentWeek > getWeek(scheduledDailyDate) && 
              status === true && 
              weeklysentStatus === true) {
              trigger.lastWeeklySent = scheduledWeeklyDate;
              trigger.save();
          }
        });
        await new Promise(resolve => setTimeout(resolve, 60000));
      } catch (error) {
        console.error('Error verifying scheduled triggers:', error);
      }
    }
  }


  cron.schedule('* * * * *', () => {
      iniciarDisparadoresProgramados();
  });

  router.post('/automatization/user', async (req, res) => {
    const automatizationList = await AutomatizationList.find({id_user:String(req.body.id_user)});
  res.json(automatizationList);
  });
  router.post('/disparadores', async (req, res) => {
    try {
      const disparador = new Disparador({
          dailyHour: req.body.dailyHour,
          messageToSent: req.body.messageToSent,
          triggerStatus : req.body.triggerStatus,
          dailysentStatus: req.body.dailysentStatus,
          id_owner: req.body.id_owner,
          id_kanban : req.body.id_kanban
      });

      await disparador.save();
      res.status(200).json({ message: 'Disparador creado' });
    } catch (error) {
      console.error('Error al crear el dispar/ ador:', error);
      res.status(500).json({ error: 'Error al crear el disparador' });
    }
  });
  router.post('/send-email', async (req, res) => {
    const { to, subject, html } = req.body;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pabloperedo04@gmail.com',
        pass: 'yxqf qcgu yaxl odvr'
      }
    });
  
    const mailOptions = {
      from: 'pabloperedo04@gmail.com',
      to,
      subject,
      html
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Correo enviado con éxito' });
    } catch (error) {
      res.status(500).json({ message: 'Error al enviar correo', error });
    }
  });
  router.post('/disparadores/list', async (req, res) => {
    try {
      const disparadores = await Disparador.find({ id_owner: req.body.id_owner });
      res.json(disparadores );
    } catch (error) {
      console.error('Error al obtener los disparadores:', error);
      res.status(500).json({ error: 'Error al obtener los disparadores' });
    }
  });
  router.put('/disparadores/upload', async (req, res) => {
    const { id_owner, id_kanban, id_trigger, triggerStatus } = req.body;
    try {
      const disparador = await Disparador.findOneAndUpdate(
        { id_trigger: id_trigger, id_owner: id_owner, id_kanban: id_kanban },
        { triggerStatus: triggerStatus },
        { new: true }
      );
  
      if (!disparador) {
        return res.status(404).json({ error: 'No se encontró el disparador con los parámetros proporcionados' });
      }
  
      return res.json({ disparador });
    } catch (error) {
      console.error('Error al actualizar el triggerStatus:', error);
      res.status(500).json({ error: 'Error al actualizar el triggerStatus' });
    }
  });
  router.post('/google-login', async (req, res) => {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
    });
  
    res.status(200).json(ticket.getPayload())
  });

module.exports = router;
