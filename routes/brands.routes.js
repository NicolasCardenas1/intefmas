const express = require('express');
const router = express.Router();
const brandsController = require('../controllers/brands.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', brandsController.getAllBrands);
router.get('/:id', brandsController.getBrandById);

// Rutas protegidas (solo admin)
router.post('/', [verifyToken, isAdmin], brandsController.createBrand);
router.put('/:id', [verifyToken, isAdmin], brandsController.updateBrand);
router.delete('/:id', [verifyToken, isAdmin], brandsController.deleteBrand);

module.exports = router;