const { Inventory, Product, Branch, sequelize } = require('../models');

// Obtener todo el inventario
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [
        { model: Product, attributes: ['id', 'codigo', 'nombre'] },
        { model: Branch, attributes: ['id', 'nombre', 'ciudad'] }
      ]
    });
    
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el inventario',
      error: error.message
    });
  }
};

// Obtener inventario por sucursal
exports.getInventoryByBranch = async (req, res) => {
  try {
    const branchId = req.params.branchId;
    
    const inventory = await Inventory.findAll({
      where: { sucursal_id: branchId },
      include: [
        { model: Product, attributes: ['id', 'codigo', 'nombre', 'precio'] }
      ]
    });
    
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el inventario por sucursal',
      error: error.message
    });
  }
};

// Obtener inventario por producto
exports.getInventoryByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    
    const inventory = await Inventory.findAll({
      where: { producto_id: productId },
      include: [
        { model: Branch, attributes: ['id', 'nombre', 'ciudad'] }
      ]
    });
    
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el inventario por producto',
      error: error.message
    });
  }
};

// Actualizar inventario
exports.updateInventory = async (req, res) => {
  try {
    const { producto_id, sucursal_id, stock, stock_minimo, ubicacion } = req.body;
    
    // Buscar si ya existe el registro
    let inventory = await Inventory.findOne({
      where: {
        producto_id,
        sucursal_id
      }
    });
    
    if (inventory) {
      // Actualizar
      await inventory.update({
        stock,
        stock_minimo,
        ubicacion,
        ultima_actualizacion: new Date()
      });
    } else {
      // Crear
      inventory = await Inventory.create({
        producto_id,
        sucursal_id,
        stock,
        stock_minimo,
        ubicacion
      });
    }
    
    res.status(200).json({
      message: 'Inventario actualizado exitosamente',
      inventory
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el inventario',
      error: error.message
    });
  }
};

// Obtener productos con bajo stock
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStock = await Inventory.findAll({
      where: sequelize.literal('stock <= stock_minimo'),
      include: [
        { model: Product, attributes: ['id', 'codigo', 'nombre'] },
        { model: Branch, attributes: ['id', 'nombre', 'ciudad'] }
      ]
    });
    
    res.status(200).json(lowStock);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener productos con bajo stock',
      error: error.message
    });
  }
};