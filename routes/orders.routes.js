const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { verifyToken, isAdmin, isVendedor, isBodeguero } = require('../middleware/auth.middleware');

// Rutas para clientes y personal
router.post('/', verifyToken, ordersController.createOrder);
router.get('/cliente/:clienteId', verifyToken, ordersController.getCustomerOrders);
router.get('/:id', verifyToken, ordersController.getOrderById);

// Rutas solo para personal (admin, vendedor, bodeguero)
router.get('/', [verifyToken, isVendedor], ordersController.getAllOrders);
router.patch('/:id/estado', [verifyToken, isVendedor], ordersController.updateOrderStatus);

module.exports = router;