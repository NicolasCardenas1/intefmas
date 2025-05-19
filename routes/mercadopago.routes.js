const express = require('express');
const router = express.Router();
const mercadopagoController = require('../controllers/mercadopago.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Ruta para crear preferencia de pago
router.post('/crear-preferencia', verifyToken, mercadopagoController.createPreference);

// Ruta para webhook (notificaciones)
router.post('/webhook', mercadopagoController.webhook);

// También puede recibir por GET (algunos servicios hacen redirecciones GET)
router.get('/webhook', mercadopagoController.webhook);

// Ruta para verificar estado de un pago
router.get('/estado/:orderId', verifyToken, mercadopagoController.checkPaymentStatus);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     MercadoPagoPreference:
 *       type: object
 *       required:
 *         - orderId
 *       properties:
 *         orderId:
 *           type: integer
 *           description: ID del pedido para el cual crear la preferencia
 */

/**
 * @swagger
 * tags:
 *   name: MercadoPago
 *   description: API para integración con Mercado Pago
 */

/**
 * @swagger
 * /api/v1/mercadopago/crear-preferencia:
 *   post:
 *     summary: Crea una preferencia de pago
 *     tags: [MercadoPago]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MercadoPagoPreference'
 *     responses:
 *       200:
 *         description: Preferencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 init_point:
 *                   type: string
 *                 sandbox_init_point:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pedido no encontrado
 */

/**
 * @swagger
 * /api/v1/mercadopago/webhook:
 *   post:
 *     summary: Recibe notificaciones de Mercado Pago
 *     tags: [MercadoPago]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: Tipo de notificación
 *       - in: query
 *         name: data.id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del recurso
 *     responses:
 *       200:
 *         description: Notificación procesada exitosamente
 */

/**
 * @swagger
 * /api/v1/mercadopago/estado/{orderId}:
 *   get:
 *     summary: Verifica el estado de un pago
 *     tags: [MercadoPago]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Estado del pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_id:
 *                   type: integer
 *                 payment_id:
 *                   type: integer
 *                 mercadopago_id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 status_detail:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pedido o pago no encontrado
 */