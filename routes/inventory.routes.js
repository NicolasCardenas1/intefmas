const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { verifyToken, isAdmin, isBodeguero } = require('../middleware/auth.middleware');

// Rutas protegidas (admin, bodeguero, vendedor)
router.get('/', verifyToken, inventoryController.getAllInventory);
router.get('/sucursal/:branchId', verifyToken, inventoryController.getInventoryByBranch);
router.get('/producto/:productId', verifyToken, inventoryController.getInventoryByProduct);
router.get('/bajo-stock', verifyToken, inventoryController.getLowStockProducts);

// Rutas solo para admin y bodeguero
router.post('/actualizar', [verifyToken, isBodeguero], inventoryController.updateInventory);

module.exports = router;