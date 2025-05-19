// services/mercadopago.service.js
const mercadopago = require('mercadopago');
require('dotenv').config();

// Configurar credenciales una sola vez
mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000');

// Función para crear una preferencia de pago
exports.createPreference = async (preferenceData) => {
  try {
    const preference = {
      items: preferenceData.items,
      back_urls: preferenceData.back_urls,
      auto_return: preferenceData.auto_return || 'approved',
      notification_url: preferenceData.notification_url,
      external_reference: preferenceData.external_reference,
      payer: preferenceData.payer || {}
    };

    const response = await mercadopago.preferences.create(preference);
    return response.body;
  } catch (error) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    throw error;
  }
};

// Función para obtener un pago por ID
exports.getPaymentById = async (paymentId) => {
  try {
    const response = await mercadopago.payment.get(paymentId);
    return response.body;
  } catch (error) {
    console.error('Error al obtener información del pago:', error);
    throw error;
  }
};

// Función para obtener un pago por referencia externa (ID de pedido)
exports.getPaymentByExternalReference = async (externalReference) => {
  try {
    const searchParams = {
      external_reference: externalReference
    };
    
    const response = await mercadopago.payment.search({
      qs: searchParams
    });
    
    return response.body.results;
  } catch (error) {
    console.error('Error al buscar pago por referencia externa:', error);
    throw error;
  }
};