const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verificar token JWT
exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: 'No se proporcionó token de autenticación' });
  }
  
  try {
    // Remover 'Bearer ' si está presente
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'ferremas_secret_key');
    req.userId = decoded.id;
    req.userRole = decoded.rol;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Verificar si el usuario es administrador
exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (user.rol === 'administrador') {
      next();
      return;
    }
    
    res.status(403).json({ message: 'Requiere rol de administrador' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verificar si el usuario es vendedor
exports.isVendedor = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (user.rol === 'vendedor' || user.rol === 'administrador') {
      next();
      return;
    }
    
    res.status(403).json({ message: 'Requiere rol de vendedor o administrador' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verificar si el usuario es bodeguero
exports.isBodeguero = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (user.rol === 'bodeguero' || user.rol === 'administrador') {
      next();
      return;
    }
    
    res.status(403).json({ message: 'Requiere rol de bodeguero o administrador' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verificar si el usuario es contador
exports.isContador = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (user.rol === 'contador' || user.rol === 'administrador') {
      next();
      return;
    }
    
    res.status(403).json({ message: 'Requiere rol de contador o administrador' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};