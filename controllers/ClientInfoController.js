const ClientInfo = require("../models/ClientInfo");

const postClientInfo = (req, res) => {
    try {
     const client = new ClientInfo({
          id_owner: req.body.id_owner,
          token: req.body.token,
          number: req.body.number
      });
      client.save((err,client) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      });
    } catch (e) {
      myConsole.log(e);
    }
  };

  module.exports = {
    postClientInfo
};
