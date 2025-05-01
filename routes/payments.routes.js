// routes/payments.routes.js
const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { verifyToken, isAdmin, isContador } = require('../middleware/auth.middleware');

// Rutas de WebPay
router.post('/webpay/crear', verifyToken, paymentsController.initiateWebPayPayment);
router.post('/webpay/confirmar', paymentsController.confirmWebPayPayment);

// Rutas de pago por transferencia
router.post('/transferencia/registrar', verifyToken, paymentsController.recordTransferPayment);
router.post('/transferencia/confirmar', [verifyToken, isContador], paymentsController.confirmTransferPayment);

// Ruta de conversión de divisas
router.get('/divisas/convertir', paymentsController.getCurrencyConversion);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Pago:
 *       type: object
 *       required:
 *         - pedido_id
 *         - monto
 *         - metodo_pago
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del pago
 *         pedido_id:
 *           type: integer
 *           description: ID del pedido
 *         monto:
 *           type: number
 *           format: float
 *           description: Monto del pago
 *         metodo_pago:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia, webpay]
 *           description: Método de pago utilizado
 *         estado:
 *           type: string
 *           enum: [pendiente, completado, rechazado]
 *           description: Estado del pago
 *         fecha_pago:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del pago
 *         referencia:
 *           type: string
 *           description: Número de referencia de la transacción
 */

/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: API para gestionar pagos
 */

/**
 * @swagger
 * /api/v1/pagos/webpay/crear:
 *   post:
 *     summary: Inicia un pago con WebPay
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pedido_id
 *               - monto
 *             properties:
 *               pedido_id:
 *                 type: integer
 *               monto:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Pago iniciado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 url:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/v1/pagos/webpay/confirmar:
 *   post:
 *     summary: Confirma un pago con WebPay
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token_ws
 *             properties:
 *               token_ws:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pago confirmado exitosamente
 *       400:
 *         description: Token inválido
 */

/**
 * @swagger
 * /api/v1/pagos/transferencia/registrar:
 *   post:
 *     summary: Registra un pago por transferencia bancaria
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pedido_id
 *               - monto
 *               - comprobante
 *             properties:
 *               pedido_id:
 *                 type: integer
 *               monto:
 *                 type: number
 *                 format: float
 *               comprobante:
 *                 type: string
 *                 description: URL o datos del comprobante de transferencia
 *     responses:
 *       200:
 *         description: Pago registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/v1/pagos/transferencia/confirmar:
 *   post:
 *     summary: Confirma un pago por transferencia bancaria
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pago_id
 *             properties:
 *               pago_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pago confirmado exitosamente
 *       400:
 *         description: ID de pago inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 */

/**
 * @swagger
 * /api/v1/pagos/divisas/convertir:
 *   get:
 *     summary: Obtiene conversión de divisas
 *     tags: [Pagos]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         required: true
 *         description: Moneda de origen (e.g., CLP)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         required: true
 *         description: Moneda de destino (e.g., USD)
 *       - in: query
 *         name: amount
 *         schema:
 *           type: number
 *         required: true
 *         description: Monto a convertir
 *     responses:
 *       200:
 *         description: Conversión exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 from:
 *                   type: string
 *                 to:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 result:
 *                   type: number
 *                 rate:
 *                   type: number
 *       400:
 *         description: Parámetros inválidos
 */