document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Obtener ID del pedido de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    
    if (!orderId) {
        window.location.href = '../index.html';
        return;
    }
    
    // Cargar detalles del pedido e inicializar MP
    loadOrderDetails(orderId);
});

// Cargar detalles del pedido - VERSIÓN MEJORADA
async function loadOrderDetails(orderId) {
    try {
        // Usar la función mejorada de autenticación
        const response = await makeAuthenticatedRequest(`/api/v1/pedidos/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar detalles del pedido');
        }
        
        const order = await response.json();
        
        // Verificar que el pedido esté en estado válido para pago
        if (order.estado !== 'pendiente') {
            showErrorMessage(`Este pedido ya no está disponible para pago. Estado actual: ${order.estado}`);
            return;
        }
        
        // Mostrar detalles del pedido
        renderOrderDetails(order);
        
        // Inicializar Mercado Pago
        initMercadoPago(orderId);
    } catch (error) {
        console.error('Error:', error);
        
        // Manejar error de autenticación
        if (handleAuthError(error)) {
            return; // Ya se manejó la redirección
        }
        
        showErrorMessage('Error al cargar los detalles del pedido. Por favor intenta nuevamente.');
    }
}

// Renderizar detalles del pedido
function renderOrderDetails(order) {
    const orderDetailsContainer = document.getElementById('order-details');
    
    // Formatear fecha
    const orderDate = new Date(order.fecha_pedido);
    const formattedDate = orderDate.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Traducir tipo de entrega
    const deliveryType = order.tipo_entrega === 'retiro_tienda' ? 'Retiro en tienda' : 'Despacho a domicilio';
    
    // Traducir estado
    const estadosTraducidos = {
        'pendiente': 'Pendiente',
        'aprobado': 'Aprobado',
        'rechazado': 'Rechazado',
        'en_preparacion': 'En preparación',
        'listo_para_entrega': 'Listo para entrega',
        'en_camino': 'En camino',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
    };
    
    // Construir el HTML para los items del pedido
    let itemsHtml = '';
    
    if (order.OrderDetails && order.OrderDetails.length > 0) {
        order.OrderDetails.forEach(detail => {
            itemsHtml += `
                <div class="order-item">
                    <div class="order-item-quantity">${detail.cantidad}x</div>
                    <div class="order-item-details">
                        <div class="order-item-name">${detail.Product.nombre}</div>
                        <div class="order-item-price">$${parseInt(detail.precio_unitario).toLocaleString('es-CL')} c/u</div>
                    </div>
                    <div class="order-item-subtotal">$${parseInt(detail.subtotal).toLocaleString('es-CL')}</div>
                </div>
            `;
        });
    }
    
    // Renderizar HTML
    orderDetailsContainer.innerHTML = `
        <div class="order-info" style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0;">Pedido #${order.codigo}</h3>
                <span style="padding: 4px 8px; background-color: #ffc107; color: #856404; border-radius: 3px; font-size: 0.8rem;">${estadosTraducidos[order.estado]}</span>
            </div>
            <div style="font-size: 0.9rem; color: #6c757d;">
                <div>📅 Fecha: ${formattedDate}</div>
                <div>🚚 Tipo de entrega: ${deliveryType}</div>
            </div>
        </div>
        
        <div class="order-items">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">📦 Productos</h3>
            ${itemsHtml}
        </div>
        
        <div class="order-totals">
            <div class="total-row">
                <span>Subtotal</span>
                <span>$${parseInt(order.subtotal).toLocaleString('es-CL')}</span>
            </div>
            <div class="total-row">
                <span>IVA (19%)</span>
                <span>$${parseInt(order.iva).toLocaleString('es-CL')}</span>
            </div>
            ${order.descuento > 0 ? `
                <div class="total-row">
                    <span>Descuento</span>
                    <span style="color: #28a745;">-$${parseInt(order.descuento).toLocaleString('es-CL')}</span>
                </div>
            ` : ''}
            ${order.costo_envio > 0 ? `
                <div class="total-row">
                    <span>Costo de envío</span>
                    <span>$${parseInt(order.costo_envio).toLocaleString('es-CL')}</span>
                </div>
            ` : ''}
            <div class="total-row final">
                <span>💰 Total a Pagar</span>
                <span>$${parseInt(order.total).toLocaleString('es-CL')}</span>
            </div>
        </div>
    `;
}

// Inicializar Mercado Pago - VERSIÓN MEJORADA
async function initMercadoPago(orderId) {
    try {
        // Mostrar loading
        document.getElementById('wallet_container').innerHTML = `
            <div class="loading-spinner"></div>
            <p style="text-align: center; margin-top: 10px;">Preparando opciones de pago...</p>
        `;
        
        // Crear preferencia usando la función mejorada
        const response = await makeAuthenticatedRequest('/api/v1/mercadopago/crear-preferencia', {
            method: 'POST',
            body: JSON.stringify({ orderId })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear preferencia de pago');
        }
        
        const preferenceData = await response.json();
        
        // Configurar el SDK de Mercado Pago con tu clave pública
        const mp = new MercadoPago('TEST-76bffce2-a206-4919-9cea-6bb37b01fe30');
        
        // Limpiar el contenedor
        document.getElementById('wallet_container').innerHTML = '';
        
        // Crear botón de pago
        const bricksBuilder = mp.bricks();
        
        await bricksBuilder.create('wallet', 'wallet_container', {
            initialization: {
                preferenceId: preferenceData.id,
                redirectMode: 'redirect'
            },
            customization: {
                texts: {
                    valueProp: 'payment_methods_logos'
                },
                visual: {
                    buttonBackground: 'default',
                    borderRadius: '6px'
                }
            },
            callbacks: {
                onError: (error) => {
                    console.error('Error en el botón de Mercado Pago:', error);
                    showPaymentError('Error al cargar las opciones de pago');
                },
                onReady: () => {
                    console.log('Botón de Mercado Pago listo');
                },
                onSubmit: () => {
                    console.log('Usuario inició el proceso de pago');
                }
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        
        // Manejar error de autenticación
        if (handleAuthError(error)) {
            return; // Ya se manejó la redirección
        }
        
        showPaymentError(error.message);
    }
}
// Mostrar error de pago
function showPaymentError(message = 'Error al inicializar el pago con Mercado Pago.') {
    document.getElementById('wallet_container').style.display = 'none';
    document.getElementById('payment-fallback').style.display = 'block';
    
    // Actualizar el mensaje de error si existe un contenedor específico
    const errorContainer = document.querySelector('#payment-fallback .error-message');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> 
            <strong>Error al cargar el pago</strong><br>
            ${message}
        `;
    }
}

// Mostrar mensaje de error general
function showErrorMessage(message) {
    document.getElementById('order-details').innerHTML = `
        <div style="background-color: #f8d7da; color: #721c24; padding: 20px; border-radius: 5px; text-align: center;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <h3>Ocurrió un problema</h3>
            <p>${message}</p>
            <div style="margin-top: 15px;">
                <a href="../index.html" class="btn secondary-btn" style="margin-right: 10px;">
                    <i class="fas fa-home"></i> Ir al Inicio
                </a>
                <button onclick="location.reload()" class="btn primary-btn">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
            </div>
        </div>
    `;
    
    // Ocultar la sección de pago
    document.querySelector('.payment-section').style.display = 'none';
}

// Función para reintentar la carga (puede ser llamada desde HTML)
window.retryPayment = function() {
    location.reload();
};

// Detectar si el usuario volvió de Mercado Pago
window.addEventListener('focus', function() {
    // Opcional: verificar el estado del pago cuando el usuario vuelve a la pestaña
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    
    if (orderId) {
        // Pequeño delay para asegurar que MP haya procesado
        setTimeout(() => {
            checkPaymentStatusSilently(orderId);
        }, 2000);
    }
});

// Verificar estado del pago silenciosamente - VERSIÓN MEJORADA
async function checkPaymentStatusSilently(orderId) {
    try {
        const response = await makeAuthenticatedRequest(`/api/v1/mercadopago/estado/${orderId}`);
        
        if (response.ok) {
            const paymentStatus = await response.json();
            
            // Redirigir si el estado cambió
            if (paymentStatus.status === 'approved') {
                window.location.href = `payment-success.html?order_id=${orderId}`;
            } else if (paymentStatus.status === 'rejected') {
                window.location.href = `payment-failure.html?order_id=${orderId}`;
            } else if (paymentStatus.status === 'pending' || paymentStatus.status === 'in_process') {
                window.location.href = `payment-pending.html?order_id=${orderId}`;
            }
        }
    } catch (error) {
        // Si es error de autenticación, manejar silenciosamente
        if (error.message.includes('expirado') || error.message.includes('token')) {
            console.log('Sesión expirada detectada silenciosamente');
            return;
        }
        
        // Otros errores silenciosos
        console.log('Error verificando estado (silencioso):', error);
    }
}