const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

let verificarAuth = (req, res, next) => {
  let token = req.get('token');

  jwt.verify(token, 'secret', (err, decoded) => {
    if(err) {
      return res.status(401).json({
        mensaje: 'Error de token',
        err
      })
    }
    req.usuario = decoded.data; 
    next();

  });

}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) return res.status(401).json({ message: "Token no proporcionado" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    req.user = user;
    next();
  });
};

module.exports = {verificarAuth, authenticateToken};