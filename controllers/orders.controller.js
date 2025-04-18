const { Order, OrderDetail, Product, User, Branch, Payment, sequelize } = require('../models');

// Generar código único para pedido
const generateOrderCode = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  
  // Obtener último pedido del día para incrementar contador
  const lastOrder = await Order.findOne({
    where: {
      codigo: {
        [sequelize.Op.like]: `ORD-${year}${month}${day}-%`
      }
    },
    order: [['createdAt', 'DESC']]
  });
  
  let counter = 1;
  
  if (lastOrder) {
    const lastCounter = parseInt(lastOrder.codigo.split('-')[2]);
    counter = lastCounter + 1;
  }
  
  return `ORD-${year}${month}${day}-${counter.toString().padStart(3, '0')}`;
};

// Crear un pedido
exports.createOrder = async (req, res) => {
  // Iniciar transacción para asegurar integridad
  const transaction = await sequelize.transaction();
  
  try {
    const {
      cliente_id,
      tipo_entrega,
      items,
      direccion_entrega,
      ciudad_entrega,
      region_entrega,
      sucursal_retiro_id
    } = req.body;
    
    // Validar que hay items
    if (!items || !items.length) {
      await transaction.rollback();
      return res.status(400).json({ message: 'El pedido debe tener al menos un producto' });
    }
    
    // Generar código único para el pedido
    const orderCode = await generateOrderCode();
    
    // Calcular subtotal, IVA y total
    let subtotal = 0;
    
    // Obtener productos para verificar stock y precios
    const productIds = items.map(item => item.producto_id);
    const products = await Product.findAll({
      where: { id: productIds }
    });
    
    // Mapear productos por ID para fácil acceso
    const productsMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});
    
    // Validar productos y calcular subtotal
    for (const item of items) {
      const product = productsMap[item.producto_id];
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Producto con ID ${item.producto_id} no encontrado` });
      }
      
      // Verificar stock si es necesario
      
      // Calcular subtotal de item
      const itemSubtotal = product.precio * item.cantidad;
      subtotal += itemSubtotal;
    }
    
    // Calcular IVA (19% en Chile)
    const iva = subtotal * 0.19;
    
    // Calcular costo de envío (simplificado)
    const costoEnvio = tipo_entrega === 'despacho_domicilio' ? 5000 : 0;
    
    // Calcular descuento (simplificado)
    const descuento = items.length >= 4 ? subtotal * 0.05 : 0;
    
    // Calcular total
    const total = subtotal + iva + costoEnvio - descuento;
    
    // Crear pedido
    const order = await Order.create({
      codigo: orderCode,
      cliente_id,
      vendedor_id: req.userRole === 'vendedor' ? req.userId : null,
      tipo_entrega,
      direccion_entrega,
      ciudad_entrega,
      region_entrega,
      sucursal_retiro_id,
      subtotal,
      iva,
      costo_envio: costoEnvio,
      descuento,
      total,
      estado: 'pendiente'
    }, { transaction });
    
    // Crear detalles del pedido
    const orderDetails = [];
    
    for (const item of items) {
      const product = productsMap[item.producto_id];
      const precio_unitario = product.precio;
      const itemSubtotal = precio_unitario * item.cantidad;
      
      const detail = await OrderDetail.create({
        pedido_id: order.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario,
        descuento: 0,
        subtotal: itemSubtotal
      }, { transaction });
      
      orderDetails.push(detail);
    }
    
    // Confirmar transacción
    await transaction.commit();
    
    // Enviar respuesta
    res.status(201).json({
      message: 'Pedido creado exitosamente',
      order: {
        ...order.toJSON(),
        detalles: orderDetails
      }
    });
  } catch (error) {
    // Revertir transacción en caso de error
    await transaction.rollback();
    
    res.status(500).json({
      message: 'Error al crear el pedido',
      error: error.message
    });
  }
};

// Obtener todos los pedidos
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'email'] },
        { model: User, as: 'vendedor', attributes: ['id', 'nombre', 'apellido'] },
        { model: Branch, as: 'sucursal_retiro', attributes: ['id', 'nombre', 'direccion'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los pedidos',
      error: error.message
    });
  }
};

// Obtener pedidos de un cliente
exports.getCustomerOrders = async (req, res) => {
  try {
    const clienteId = req.params.clienteId;
    
    const orders = await Order.findAll({
      where: { cliente_id: clienteId },
      include: [
        { model: OrderDetail, include: [{ model: Product, attributes: ['id', 'nombre', 'codigo'] }] },
        { model: Branch, as: 'sucursal_retiro', attributes: ['id', 'nombre', 'direccion'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los pedidos del cliente',
      error: error.message
    });
  }
};

// Obtener un pedido por ID
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'email'] },
        { model: User, as: 'vendedor', attributes: ['id', 'nombre', 'apellido'] },
        { model: Branch, as: 'sucursal_retiro', attributes: ['id', 'nombre', 'direccion'] },
        { 
          model: OrderDetail, 
          include: [{ model: Product, attributes: ['id', 'nombre', 'codigo', 'imagen'] }] 
        },
        { model: Payment }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el pedido',
      error: error.message
    });
  }
};

// Actualizar estado de un pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { estado } = req.body;
    
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Validar transición de estado
    const validTransitions = {
      'pendiente': ['aprobado', 'rechazado', 'cancelado'],
      'aprobado': ['en_preparacion', 'cancelado'],
      'en_preparacion': ['listo_para_entrega', 'cancelado'],
      'listo_para_entrega': ['en_camino', 'entregado'],
      'en_camino': ['entregado', 'cancelado']
    };
    
    if (!validTransitions[order.estado] || !validTransitions[order.estado].includes(estado)) {
      return res.status(400).json({ 
        message: `No se puede cambiar el estado de ${order.estado} a ${estado}` 
      });
    }
    
    // Actualizar estado
    await order.update({ 
      estado,
      fecha_aprobacion: estado === 'aprobado' ? new Date() : order.fecha_aprobacion,
      fecha_preparacion: estado === 'en_preparacion' ? new Date() : order.fecha_preparacion,
      fecha_despacho: estado === 'en_camino' ? new Date() : order.fecha_despacho,
      fecha_entrega: estado === 'entregado' ? new Date() : order.fecha_entrega
    });
    
    res.status(200).json({
      message: 'Estado del pedido actualizado exitosamente',
      order
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el estado del pedido',
      error: error.message
    });
  }
};