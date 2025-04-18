// controllers/branches.controller.js
const { Branch } = require('../models');

// Obtener todas las sucursales
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({ where: { activo: true } });
    
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las sucursales',
      error: error.message
    });
  }
};

// Obtener una sucursal por ID
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }
    
    res.status(200).json(branch);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la sucursal',
      error: error.message
    });
  }
};

// Crear una nueva sucursal
exports.createBranch = async (req, res) => {
  try {
    const { nombre, direccion, ciudad, region, telefono, email, horario } = req.body;
    
    // Crear la sucursal
    const branch = await Branch.create({
      nombre,
      direccion,
      ciudad,
      region,
      telefono,
      email,
      horario
    });
    
    res.status(201).json({
      message: 'Sucursal creada exitosamente',
      branch
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear la sucursal',
      error: error.message
    });
  }
};

// Actualizar una sucursal
exports.updateBranch = async (req, res) => {
  try {
    const branchId = req.params.id;
    const branch = await Branch.findByPk(branchId);
    
    if (!branch) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }
    
    await branch.update(req.body);
    
    res.status(200).json({
      message: 'Sucursal actualizada exitosamente',
      branch
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar la sucursal',
      error: error.message
    });
  }
};

// Desactivar una sucursal
exports.deleteBranch = async (req, res) => {
  try {
    const branchId = req.params.id;
    const branch = await Branch.findByPk(branchId);
    
    if (!branch) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }
    
    // No eliminamos realmente, solo desactivamos
    await branch.update({ activo: false });
    
    res.status(200).json({
      message: 'Sucursal eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar la sucursal',
      error: error.message
    });
  }
};