// routes/users.routes.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas protegidas (sólo admin)
router.get('/', [verifyToken, isAdmin], usersController.getAllUsers);
router.get('/:id', [verifyToken, isAdmin], usersController.getUserById);
router.post('/', [verifyToken, isAdmin], usersController.createUser);
router.put('/:id', [verifyToken, isAdmin], usersController.updateUser);
router.post('/:id/cambiar-password', verifyToken, usersController.changePassword);
router.patch('/:id/desactivar', [verifyToken, isAdmin], usersController.deactivateUser);

module.exports = router;