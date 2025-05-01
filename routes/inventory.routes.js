const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { verifyToken, isAdmin, isBodeguero } = require('../middleware/auth.middleware');

// Rutas protegidas (admin, bodeguero, vendedor)
router.get('/', verifyToken, inventoryController.getAllInventory);
router.get('/sucursal/:branchId', verifyToken, inventoryController.getInventoryByBranch);
router.get('/producto/:productId', verifyToken, inventoryController.getInventoryByProduct);
router.get('/bajo-stock', verifyToken, inventoryController.getLowStockProducts);

// Rutas de movimientos
router.post('/movimiento', [verifyToken, isBodeguero], inventoryController.registerMovement);
router.get('/movimientos', verifyToken, inventoryController.getMovementHistory);

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
 *     
 *     MovimientoInventario:
 *       type: object
 *       required:
 *         - producto_id
 *         - sucursal_id
 *         - usuario_id
 *         - tipo_movimiento
 *         - cantidad
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del movimiento
 *         producto_id:
 *           type: integer
 *           description: ID del producto
 *         sucursal_id:
 *           type: integer
 *           description: ID de la sucursal
 *         usuario_id:
 *           type: integer
 *           description: ID del usuario que realizó el movimiento
 *         tipo_movimiento:
 *           type: string
 *           enum: [entrada, salida, ajuste]
 *           description: Tipo de operación realizada
 *         cantidad:
 *           type: integer
 *           description: Cantidad afectada
 *         stock_anterior:
 *           type: integer
 *           description: Stock antes del movimiento
 *         stock_nuevo:
 *           type: integer
 *           description: Stock después del movimiento
 *         descripcion:
 *           type: string
 *           description: Descripción o motivo del movimiento
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del movimiento
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

/**
 * @swagger
 * /api/v1/inventario/movimiento:
 *   post:
 *     summary: Registra un movimiento de inventario (entrada, salida o ajuste)
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
 *               - tipo_movimiento
 *             properties:
 *               producto_id:
 *                 type: integer
 *                 description: ID del producto
 *               sucursal_id:
 *                 type: integer
 *                 description: ID de la sucursal
 *               cantidad:
 *                 type: integer
 *                 description: Cantidad a modificar
 *               tipo_movimiento:
 *                 type: string
 *                 enum: [entrada, salida, ajuste]
 *                 description: Tipo de operación
 *               ubicacion:
 *                 type: string
 *                 description: Ubicación física (opcional)
 *               descripcion:
 *                 type: string
 *                 description: Motivo del movimiento (opcional)
 *     responses:
 *       200:
 *         description: Movimiento registrado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Producto o sucursal no encontrados
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/v1/inventario/movimientos:
 *   get:
 *     summary: Obtiene historial de movimientos de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: producto_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de producto (opcional)
 *       - in: query
 *         name: sucursal_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de sucursal (opcional)
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial (YYYY-MM-DD)
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de movimientos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */