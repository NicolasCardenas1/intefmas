const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);

// Rutas protegidas (solo admin)
router.post('/', [verifyToken, isAdmin], categoriesController.createCategory);
router.put('/:id', [verifyToken, isAdmin], categoriesController.updateCategory);
router.delete('/:id', [verifyToken, isAdmin], categoriesController.deleteCategory);

module.exports = router;