const { Category, Product } = require('../models');

// Obtener todas las categorías
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { activo: true },
      include: [
        { model: Category, as: 'subcategorias', attributes: ['id', 'nombre'] }
      ]
    });
    
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las categorías',
      error: error.message
    });
  }
};

// Obtener una categoría por ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'subcategorias', attributes: ['id', 'nombre'] },
        { model: Product, attributes: ['id', 'nombre', 'codigo'] }
      ]
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la categoría',
      error: error.message
    });
  }
};

// Crear una nueva categoría
exports.createCategory = async (req, res) => {
  try {
    const { nombre, descripcion, imagen, categoria_padre_id } = req.body;
    
    // Verificar si el nombre ya existe
    const categoryExists = await Category.findOne({ where: { nombre } });
    if (categoryExists) {
      return res.status(400).json({ message: 'El nombre de categoría ya existe' });
    }
    
    // Crear la categoría
    const category = await Category.create({
      nombre,
      descripcion,
      imagen,
      categoria_padre_id
    });
    
    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear la categoría',
      error: error.message
    });
  }
};

// Actualizar una categoría
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findByPk(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    await category.update(req.body);
    
    res.status(200).json({
      message: 'Categoría actualizada exitosamente',
      category
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar la categoría',
      error: error.message
    });
  }
};

// Eliminar una categoría (desactivar)
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findByPk(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    // No eliminamos realmente, solo desactivamos
    await category.update({ activo: false });
    
    res.status(200).json({
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar la categoría',
      error: error.message
    });
  }
};