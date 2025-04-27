const Client = require("../models/Client");
const User = require("../models/User");
const Message = require("../models/Message");
const mongoose = require("mongoose");

const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const postNewAccountUser = (req, res) => {
  try {
    console.log(req.body)
   const client = new Client({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, saltRounds),
        role: req.body.role,
        id_owner: req.body.id_owner,
        active: req.body.active
    });
    client.save((err,client) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        email: client.email,
        active: client.active,
        role: client.role,
        id_owner: client.id_owner,
      });
    });
  } catch (e) {
  }
};
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Client.findOne({ email });

    if (!user) {
      return res.status(401).send({ message: "Usuario no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user._id, id_owner: user.id_owner }, JWT_SECRET, { expiresIn: "24h" });

    res.send({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).send({ message: "Error interno del servidor" });
  }
};

module.exports = { loginUser };

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
}
const getUser = async (req, res) =>{
    try {
        const usuarioDB = await Client.findOne({email: req.body.email});
    
        if(!usuarioDB){
          return res.status(400).json({
            mensaje: 'Usuario! o contraseña inválidos',
          });
        }
        if( !bcrypt.compareSync(req.body.password, usuarioDB.password) ){
          return res.status(400).json({
            mensaje: 'Usuario o contraseña! inválidos',
          });
        }
        let token = jwt.sign({
            data: usuarioDB
          }, 'secret', { expiresIn: 60 * 60 * 24 * 30});

        return res.json({
          usuarioDB,
          token: token
        })
        
      } catch (error) {
        return res.status(400).json({
          mensaje: 'Ocurrio un error',
          error
        });
      }
};
const getClients = async (req, res) => {
  try {
    const { id_owner, sales_id, clientName, page = 1, limit = 0 } = req.body;

    let filter = { id_owner };
    if (sales_id) {
      filter.sales_id = sales_id;
    }

    let clientList = await User.find(filter)
      .populate("sales_id")
      .populate("client_location");

    if (clientName) {
      const clientNameLower = clientName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      clientList = clientList.filter((c) => {
        const name = (c.name || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        const lastName = (c.lastName || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        return name.includes(clientNameLower) || lastName.includes(clientNameLower);
      });
    }

    const start = (page - 1) * limit;
    const paginatedClients = limit > 0 ? clientList.slice(start, start + limit) : clientList;

    res.json({
      clients: paginatedClients,
      totalPages: limit > 0 ? Math.ceil(clientList.length / limit) : 1,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes", error });
  }
};
const getClientsArchived = async (req, res) => {
  const clientList = await User.find({id_owner:String(req.body.id_owner),status:"ARCHIVED"}).populate("chat");
  res.json(clientList);
};
const getClientInfoById = async (req, res) => {
  const clientList = await User.find({id_user:String(req.body.id_user)});
  res.json(clientList);
};
const getClientInfoByIdAndSales = async (req, res) => {
  try {
    console.log(req.body)
    const { id_user, salesId, page, limit, search} = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      id_owner: String(id_user),
      sales_id: mongoose.Types.ObjectId(salesId),
    };

    if (search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { lastName: regex }];
    }

    const [clientList, totalClients] = await Promise.all([
      User.find(query)
        .populate("client_location")
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalClients / limit);

    res.json({
      data: clientList,
      totalPages,
      currentPage: parseInt(page),
      totalClients,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Error fetching clients" });
  }
};

const updateUserFile = async (req, res) => {
  const { id_user, name, lastName, number, company, email, directionId  } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { id_user },
      { 
        name: name,
        lastName: lastName,
        number: number,
        company: company,
        email: email,
        directionId: directionId        
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error });
  }
};
const postClient = (req, res) => {
  try {
   const clients = new User({
      name: req.body.name,
      lastName: req.body.lastName,
      profilePicture: req.body.profilePicture,
      icon: req.body.icon, 
      directionId: "",
      number: req.body.number, 
      identityNumber: 12,
      company: req.body.company,
      email: req.body.email,
      socialNetwork: req.body.socialNetwork,
      notes: req.body.notes,
      id_user: req.body.id_user,
      id_owner: req.body.id_owner,
      status: "SHOW",
      chat: req.body.chat,
      userCategory: req.body.userCategory,
      client_location: mongoose.Types.ObjectId(req.body.directionId),
      sales_id: mongoose.Types.ObjectId(req.body.sales_id)
    });
    clients.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.send({ message: "User was registered successfully!" });
    });
  } catch (e) {
    console.log("Mensaje de depuración", variable);
  }
};
const updateUserStatus = async (req, res) => {
  const { id_user, status } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { id_user },
      { status: status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error });
  }
};
const getMessagesById = async (req, res) => {
  const clientList = await Message.find({id_message:String(req.body.id_message)});
  res.json(clientList);
};
const deleteClient = async (req, res) => {
  const userId = req.body.id_user;
  const deleteProduct = await User.deleteOne({ id_user: userId });

  if (deleteProduct.deletedCount === 0) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  return res.status(200).json({ message: 'Cliente eliminado correctamente' });
};
module.exports = {
  postNewAccountUser, auth,getUser, getClientInfoByIdAndSales,loginUser,getClients, getClientsArchived,getMessagesById, getClientInfoById, postClient, updateUserFile,updateUserStatus, deleteClient
};
