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