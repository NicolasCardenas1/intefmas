// controllers/users.controller.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (sólo admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los usuarios',
      error: error.message
    });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el usuario',
      error: error.message
    });
  }
};

// Crear un nuevo usuario (admin puede crear otros roles)
exports.createUser = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, telefono, direccion, ciudad, region, rut } = req.body;
    
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
      rol: rol || 'cliente',
      telefono,
      direccion,
      ciudad,
      region,
      rut
    });
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
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
      message: 'Error al crear el usuario',
      error: error.message
    });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { nombre, apellido, email, rol, telefono, direccion, ciudad, region, rut, activo } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Si intenta cambiar el rol, verificar que sea admin
    if (rol && req.userRole !== 'administrador') {
      return res.status(403).json({ message: 'No tiene permisos para cambiar el rol' });
    }
    
    // Actualizar usuario
    await user.update({
      nombre,
      apellido,
      email,
      rol,
      telefono,
      direccion,
      ciudad,
      region,
      rut,
      activo
    });
    
    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        activo: user.activo
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el usuario',
      error: error.message
    });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    
    // Verificar que sea el propio usuario o un administrador
    if (req.userId != userId && req.userRole !== 'administrador') {
      return res.status(403).json({ message: 'No tiene permisos para cambiar esta contraseña' });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Si es el propio usuario, verificar contraseña actual
    if (req.userId == userId) {
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Contraseña actual incorrecta' });
      }
    }
    
    // Generar hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Actualizar contraseña
    await user.update({
      password: hashedPassword,
      primer_login: false
    });
    
    res.status(200).json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cambiar la contraseña',
      error: error.message
    });
  }
};

// Desactivar un usuario
exports.deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // No permitir desactivar al propio usuario
    if (req.userId == userId) {
      return res.status(400).json({ message: 'No puede desactivar su propia cuenta' });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Desactivar usuario
    await user.update({ activo: false });
    
    res.status(200).json({
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al desactivar el usuario',
      error: error.message
    });
  }
};