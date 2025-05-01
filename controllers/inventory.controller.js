const { Inventory, Product, Branch, User, InventoryMovement, sequelize } = require('../models');
const { Op } = require('sequelize');

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

// Actualizar inventario de forma simple
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

// Registrar movimiento de inventario (con transacción)
exports.registerMovement = async (req, res) => {
  // Iniciar transacción para asegurar consistencia
  const transaction = await sequelize.transaction();
  
  try {
    const { producto_id, sucursal_id, cantidad, tipo_movimiento, ubicacion } = req.body;
    
    // Validar que producto y sucursal existan
    const product = await Product.findByPk(producto_id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const branch = await Branch.findByPk(sucursal_id, { transaction });
    if (!branch) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }
    
    // Buscar el registro de inventario
    let inventory = await Inventory.findOne({
      where: { producto_id, sucursal_id },
      transaction
    });
    
    let stockAnterior = 0;
    
    if (!inventory) {
      // Si no existe el registro, lo creamos
      inventory = await Inventory.create({
        producto_id,
        sucursal_id,
        stock: 0, // Comenzamos con stock cero
        stock_minimo: 5, // Valor predeterminado
        ubicacion: ubicacion || 'Sin asignar'
      }, { transaction });
    } else {
      stockAnterior = inventory.stock;
    }
    
    // Calcular nuevo stock según el tipo de movimiento
    let nuevoStock;
    
    switch (tipo_movimiento) {
      case 'entrada':
        nuevoStock = stockAnterior + cantidad;
        break;
      case 'salida':
        nuevoStock = stockAnterior - cantidad;
        if (nuevoStock < 0) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: 'Stock insuficiente',
            stockActual: stockAnterior,
            cantidadSolicitada: cantidad 
          });
        }
        break;
      case 'ajuste':
        nuevoStock = cantidad;
        break;
      default:
        await transaction.rollback();
        return res.status(400).json({ message: 'Tipo de movimiento inválido' });
    }
    
    // Actualizar el inventario
    await inventory.update({
      stock: nuevoStock,
      ubicacion: ubicacion || inventory.ubicacion,
      ultima_actualizacion: new Date()
    }, { transaction });
    
    // Registrar el movimiento
    const movimiento = await InventoryMovement.create({
      producto_id,
      sucursal_id,
      usuario_id: req.userId || 1, // Asumiendo que tienes el ID del usuario en el request
      tipo_movimiento,
      cantidad,
      stock_anterior: stockAnterior,
      stock_nuevo: nuevoStock,
      fecha: new Date()
    }, { transaction });
    
    // Confirmar la transacción
    await transaction.commit();
    
    res.status(200).json({
      message: 'Movimiento de inventario registrado exitosamente',
      inventario: inventory,
      movimiento
    });
    
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    
    res.status(500).json({
      message: 'Error al registrar movimiento de inventario',
      error: error.message
    });
  }
};

// Obtener historial de movimientos
exports.getMovementHistory = async (req, res) => {
  try {
    const { producto_id, sucursal_id, desde, hasta } = req.query;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    if (producto_id) whereConditions.producto_id = producto_id;
    if (sucursal_id) whereConditions.sucursal_id = sucursal_id;
    
    // Filtro de fechas
    if (desde || hasta) {
      whereConditions.fecha = {};
      
      if (desde) {
        whereConditions.fecha[Op.gte] = new Date(desde);
      }
      
      if (hasta) {
        whereConditions.fecha[Op.lte] = new Date(hasta);
      }
    }
    
    // Obtener movimientos con sus relaciones
    const movimientos = await InventoryMovement.findAll({
      where: whereConditions,
      include: [
        { model: Product, attributes: ['id', 'codigo', 'nombre'] },
        { model: Branch, attributes: ['id', 'nombre', 'ciudad'] },
        { model: User, attributes: ['id', 'nombre', 'apellido', 'rol'] }
      ],
      order: [['fecha', 'DESC']]
    });
    
    res.status(200).json(movimientos);
    
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener historial de movimientos',
      error: error.message
    });
  }
};