const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const { verifyToken, isAdmin, isVendedor } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);
router.get('/categoria/:categoriaId', productsController.getProductsByCategory);

// Rutas protegidas (solo admin y vendedor)
router.post('/', [verifyToken, isAdmin], productsController.createProduct);
router.put('/:id', [verifyToken, isAdmin], productsController.updateProduct);
router.delete('/:id', [verifyToken, isAdmin], productsController.deleteProduct);

module.exports = router;