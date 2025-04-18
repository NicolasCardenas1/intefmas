const { Product, Category, Brand, Inventory } = require('../models');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const productos = await Product.findAll({
      where: { activo: true },
      include: [
        { model: Category, attributes: ['id', 'nombre'] },
        { model: Brand, attributes: ['id', 'nombre'] }
      ]
    });
    
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los productos',
      error: error.message
    });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const producto = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ['id', 'nombre'] },
        { model: Brand, attributes: ['id', 'nombre'] },
        { model: Inventory, attributes: ['sucursal_id', 'stock'] }
      ]
    });
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el producto',
      error: error.message
    });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      descripcion,
      precio,
      imagen,
      categoria_id,
      marca_id,
      destacado
    } = req.body;
    
    // Verificar si el código ya existe
    const productoExistente = await Product.findOne({ where: { codigo } });
    if (productoExistente) {
      return res.status(400).json({ message: 'El código de producto ya existe' });
    }
    
    // Crear el producto
    const producto = await Product.create({
      codigo,
      nombre,
      descripcion,
      precio,
      imagen,
      categoria_id,
      marca_id,
      destacado
    });
    
    res.status(201).json({
      message: 'Producto creado exitosamente',
      producto
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el producto',
      error: error.message
    });
  }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
  try {
    const productoId = req.params.id;
    const producto = await Product.findByPk(productoId);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await producto.update(req.body);
    
    res.status(200).json({
      message: 'Producto actualizado exitosamente',
      producto
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el producto',
      error: error.message
    });
  }
};

// Eliminar un producto (desactivar)
exports.deleteProduct = async (req, res) => {
  try {
    const productoId = req.params.id;
    const producto = await Product.findByPk(productoId);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // No eliminamos realmente, solo desactivamos
    await producto.update({ activo: false });
    
    res.status(200).json({
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el producto',
      error: error.message
    });
  }
};

// Obtener productos por categoría
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoriaId = req.params.categoriaId;
    
    const productos = await Product.findAll({
      where: { 
        categoria_id: categoriaId,
        activo: true 
      },
      include: [
        { model: Brand, attributes: ['id', 'nombre'] }
      ]
    });
    
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los productos por categoría',
      error: error.message
    });
  }
};