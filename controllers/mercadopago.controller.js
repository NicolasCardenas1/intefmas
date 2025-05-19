const mercadopagoService = require('../services/mercadopago.service');
const { Order, Payment, OrderDetail, Product, User } = require('../models');
const { sequelize } = require('../config/database');

// Crear preferencia de pago
exports.createPreference = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Buscar el pedido
    const order = await Order.findByPk(orderId, {
      include: [
        { 
          model: OrderDetail,
          include: [{ model: Product }]
        },
        {
          model: User,
          as: 'cliente'
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Verificar que el pedido pertenezca al usuario actual
    if (order.cliente_id !== req.userId && req.userRole !== 'administrador' && req.userRole !== 'vendedor') {
      return res.status(403).json({ message: 'No tiene permisos para acceder a este pedido' });
    }
    
    // Crear los items para la preferencia
    const items = order.OrderDetails.map(detail => ({
      id: detail.producto_id.toString(),
      title: detail.Product.nombre,
      unit_price: parseFloat(detail.precio_unitario),
      quantity: detail.cantidad,
      currency_id: 'CLP',
      picture_url: detail.Product.imagen || 'https://via.placeholder.com/150'
    }));
    
    // Datos del cliente
    const payer = {
      name: order.cliente.nombre,
      surname: order.cliente.apellido,
      email: order.cliente.email
    };
    
    // URLs de retorno
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const back_urls = {
      success: `${baseUrl}/pages/payment-success.html?order_id=${order.id}`,
      failure: `${baseUrl}/pages/payment-failure.html?order_id=${order.id}`,
      pending: `${baseUrl}/pages/payment-pending.html?order_id=${order.id}`
    };
    
    // URL de notificación
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const notification_url = `${backendUrl}/api/v1/mercadopago/webhook`;
    
    // Crear la preferencia
    const preferenceData = {
      items,
      back_urls,
      auto_return: 'approved',
      notification_url,
      external_reference: order.id.toString(),
      payer
    };
    
    const preference = await mercadopagoService.createPreference(preferenceData);
    
    // Registrar el intento de pago
    await Payment.create({
      pedido_id: order.id,
      monto: order.total,
      metodo_pago: 'mercadopago',
      estado: 'pendiente',
      gateway: 'mercadopago',
      transaccion_id: preference.id,
      moneda: 'CLP'
    });
    
    // Devolver la preferencia
    res.status(200).json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point
    });
  } catch (error) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    res.status(500).json({ 
      message: 'Error al crear la preferencia de pago',
      error: error.message
    });
  }
};

// Webhook para recibir notificaciones de pagos
exports.webhook = async (req, res) => {
  try {
    const { type, data } = req.query;
    
    // Sólo procesar notificaciones de pagos
    if (type !== 'payment') {
      return res.status(200).send();
    }
    
    const paymentId = data.id;
    
    // Obtener información del pago
    const paymentInfo = await mercadopagoService.getPaymentById(paymentId);
    
    // Obtener el ID del pedido desde la referencia externa
    const orderId = paymentInfo.external_reference;
    
    // Iniciar transacción
    const transaction = await sequelize.transaction();
    
    try {
      // Buscar el pedido
      const order = await Order.findByPk(orderId, { transaction });
      
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      
      // Buscar el pago en nuestra base de datos
      const payment = await Payment.findOne({ 
        where: { 
          pedido_id: orderId,
          gateway: 'mercadopago' 
        },
        transaction
      });
      
      if (!payment) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      // Actualizar el estado del pago según Mercado Pago
      let paymentStatus;
      
      switch (paymentInfo.status) {
        case 'approved':
          paymentStatus = 'aprobado';
          break;
        case 'pending':
          paymentStatus = 'pendiente';
          break;
        case 'in_process':
          paymentStatus = 'procesando';
          break;
        case 'rejected':
          paymentStatus = 'rechazado';
          break;
        case 'refunded':
          paymentStatus = 'reembolsado';
          break;
        default:
          paymentStatus = 'pendiente';
      }
      
      // Actualizar el pago
      await payment.update({
        estado: paymentStatus,
        fecha_pago: paymentStatus === 'aprobado' ? new Date() : null,
        transaccion_id: paymentId
      }, { transaction });
      
      // Si el pago fue aprobado, actualizar el estado del pedido
      if (paymentStatus === 'aprobado' && order.estado === 'pendiente') {
        await order.update({ 
          estado: 'aprobado',
          fecha_aprobacion: new Date()
        }, { transaction });
      }
      
      // Confirmar transacción
      await transaction.commit();
      
      // Responder exitosamente al webhook
      res.status(200).send();
    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error);
    res.status(500).json({ 
      message: 'Error al procesar webhook',
      error: error.message
    });
  }
};

// Verificar estado de un pago
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Buscar el pedido
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Payment, where: { gateway: 'mercadopago' } }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Verificar que el pedido pertenezca al usuario actual
    if (order.cliente_id !== req.userId && req.userRole !== 'administrador' && req.userRole !== 'vendedor') {
      return res.status(403).json({ message: 'No tiene permisos para acceder a este pedido' });
    }
    
    // Si no hay pagos registrados
    if (!order.Payments || order.Payments.length === 0) {
      return res.status(404).json({ message: 'No hay pagos registrados para este pedido' });
    }
    
    const payment = order.Payments[0];
    
    // Consultar el estado actual del pago en Mercado Pago
    const payments = await mercadopagoService.getPaymentByExternalReference(orderId.toString());
    
    if (payments.length === 0) {
      return res.status(200).json({
        order_id: orderId,
        payment_id: payment.id,
        status: payment.estado,
        date: payment.fecha_pago,
        amount: payment.monto,
        currency: payment.moneda
      });
    }
    
    // Devolver la información del pago más reciente
    const latestPayment = payments[0];
    
    res.status(200).json({
      order_id: orderId,
      payment_id: payment.id,
      mercadopago_id: latestPayment.id,
      status: latestPayment.status,
      status_detail: latestPayment.status_detail,
      date: latestPayment.date_approved || latestPayment.date_created,
      amount: latestPayment.transaction_amount,
      currency: latestPayment.currency_id
    });
  } catch (error) {
    console.error('Error al verificar estado de pago:', error);
    res.status(500).json({ 
      message: 'Error al verificar el estado del pago',
      error: error.message 
    });
  }
};