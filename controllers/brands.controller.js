const { Brand, Product } = require('../models');

// Obtener todas las marcas
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({ where: { activo: true } });
    
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las marcas',
      error: error.message
    });
  }
};

// Obtener una marca por ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id, {
      include: [
        { model: Product, attributes: ['id', 'nombre', 'codigo'] }
      ]
    });
    
    if (!brand) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }
    
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la marca',
      error: error.message
    });
  }
};

// Crear una nueva marca
exports.createBrand = async (req, res) => {
  try {
    const { nombre, descripcion, logo, sitio_web } = req.body;
    
    // Verificar si el nombre ya existe
    const brandExists = await Brand.findOne({ where: { nombre } });
    if (brandExists) {
      return res.status(400).json({ message: 'El nombre de marca ya existe' });
    }
    
    // Crear la marca
    const brand = await Brand.create({
      nombre,
      descripcion,
      logo,
      sitio_web
    });
    
    res.status(201).json({
      message: 'Marca creada exitosamente',
      brand
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear la marca',
      error: error.message
    });
  }
};

// Actualizar una marca
exports.updateBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const brand = await Brand.findByPk(brandId);
    
    if (!brand) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }
    
    await brand.update(req.body);
    
    res.status(200).json({
      message: 'Marca actualizada exitosamente',
      brand
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar la marca',
      error: error.message
    });
  }
};

// Eliminar una marca (desactivar)
exports.deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const brand = await Brand.findByPk(brandId);
    
    if (!brand) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }
    
    // No eliminamos realmente, solo desactivamos
    await brand.update({ activo: false });
    
    res.status(200).json({
      message: 'Marca eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar la marca',
      error: error.message
    });
  }
};