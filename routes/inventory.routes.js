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

/**
 * @swagger
 * components:
 *   schemas:
 *     Inventario:
 *       type: object
 *       required:
 *         - producto_id
 *         - sucursal_id
 *         - cantidad
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del registro de inventario
 *         producto_id:
 *           type: integer
 *           description: ID del producto
 *         sucursal_id:
 *           type: integer
 *           description: ID de la sucursal
 *         cantidad:
 *           type: integer
 *           description: Cantidad disponible en inventario
 *         stock_minimo:
 *           type: integer
 *           description: Cantidad mínima requerida antes de reabastecimiento
 *         ubicacion:
 *           type: string
 *           description: Ubicación física dentro de la sucursal
 */

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: API para gestionar el inventario de productos
 */

/**
 * @swagger
 * /api/v1/inventario:
 *   get:
 *     summary: Obtiene todo el inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registros de inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventario'
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/v1/inventario/sucursal/{branchId}:
 *   get:
 *     summary: Obtiene el inventario de una sucursal específica
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Inventario de la sucursal
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventario'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Sucursal no encontrada
 */

/**
 * @swagger
 * /api/v1/inventario/producto/{productId}:
 *   get:
 *     summary: Obtiene el inventario de un producto específico
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Inventario del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventario'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /api/v1/inventario/bajo-stock:
 *   get:
 *     summary: Obtiene productos con bajo stock
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos con bajo stock
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventario'
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/v1/inventario/actualizar:
 *   post:
 *     summary: Actualiza el inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - producto_id
 *               - sucursal_id
 *               - cantidad
 *             properties:
 *               producto_id:
 *                 type: integer
 *               sucursal_id:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *               tipo_movimiento:
 *                 type: string
 *                 enum: [entrada, salida, ajuste]
 *     responses:
 *       200:
 *         description: Inventario actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 */