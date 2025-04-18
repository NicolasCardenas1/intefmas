const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;
    
    // Verificar si el email ya existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }
    
    // Crear el usuario
    const user = await User.create({
      nombre,
      apellido,
      email,
      password,
      rol: rol || 'cliente'
    });
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'ferremas_secret_key',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );
    
    // Respuesta
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    
    // Actualizar último login
    user.ultimo_login = new Date();
    await user.save();
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'ferremas_secret_key',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );
    
    // Respuesta
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// Obtener información del usuario actual
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener información del usuario',
      error: error.message
    });
  }
};