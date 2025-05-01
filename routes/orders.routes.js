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

/**
 * @swagger
 * components:
 *   schemas:
 *     Pedido:
 *       type: object
 *       required:
 *         - cliente_id
 *         - sucursal_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del pedido
 *         cliente_id:
 *           type: integer
 *           description: ID del cliente
 *         sucursal_id:
 *           type: integer
 *           description: ID de la sucursal
 *         fecha_pedido:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del pedido
 *         estado:
 *           type: string
 *           enum: [pendiente, en_proceso, completado, cancelado]
 *           description: Estado actual del pedido
 *         subtotal:
 *           type: number
 *           format: float
 *           description: Subtotal del pedido
 *         iva:
 *           type: number
 *           format: float
 *           description: IVA aplicado
 *         total:
 *           type: number
 *           format: float
 *           description: Total del pedido
 *         metodo_pago:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia, webpay]
 *           description: Método de pago utilizado
 *     DetallePedido:
 *       type: object
 *       required:
 *         - pedido_id
 *         - producto_id
 *         - cantidad
 *         - precio_unitario
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del detalle de pedido
 *         pedido_id:
 *           type: integer
 *           description: ID del pedido
 *         producto_id:
 *           type: integer
 *           description: ID del producto
 *         cantidad:
 *           type: integer
 *           description: Cantidad solicitada
 *         precio_unitario:
 *           type: number
 *           format: float
 *           description: Precio unitario del producto
 */

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: API para gestionar pedidos
 */

/**
 * @swagger
 * /api/v1/pedidos:
 *   post:
 *     summary: Crea un nuevo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sucursal_id
 *               - productos
 *             properties:
 *               sucursal_id:
 *                 type: integer
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     producto_id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *               metodo_pago:
 *                 type: string
 *                 enum: [efectivo, tarjeta, transferencia, webpay]
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/v1/pedidos/cliente/{clienteId}:
 *   get:
 *     summary: Obtiene los pedidos de un cliente específico
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Pedidos del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cliente no encontrado
 */

/**
 * @swagger
 * /api/v1/pedidos/{id}:
 *   get:
 *     summary: Obtiene un pedido por ID
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pedido no encontrado
 */

/**
 * @swagger
 * /api/v1/pedidos:
 *   get:
 *     summary: Obtiene todos los pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 */

/**
 * @swagger
 * /api/v1/pedidos/{id}/estado:
 *   patch:
 *     summary: Actualiza el estado de un pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_proceso, completado, cancelado]
 *     responses:
 *       200:
 *         description: Estado del pedido actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Pedido no encontrado
 */