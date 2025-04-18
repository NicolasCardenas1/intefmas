document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Redirigir a login si no está autenticado
        window.location.href = 'login.html';
        return;
    }
    
    // Obtener el ID del pedido de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!orderId) {
        window.location.href = '../index.html';
        return;
    }
    
    // Cargar detalles del pedido
    loadOrderDetails(orderId);
});

// Función para cargar detalles del pedido
async function loadOrderDetails(orderId) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/v1/pedidos/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar detalles del pedido');
        }
        
        const order = await response.json();
        
        // Actualizar información del pedido
        document.getElementById('order-number').textContent = order.codigo;
        
        // Formatear fecha
        const orderDate = new Date(order.fecha_pedido);
        document.getElementById('order-date').textContent = orderDate.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
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
        
        document.getElementById('order-status').textContent = estadosTraducidos[order.estado] || order.estado;
        
        // Método de pago
        if (order.Payments && order.Payments.length > 0) {
            const payment = order.Payments[0];
            const metodosPagoTraducidos = {
                'debito': 'Tarjeta de Débito (WebPay)',
                'credito': 'Tarjeta de Crédito (WebPay)',
                'transferencia': 'Transferencia Bancaria'
            };
            
            document.getElementById('payment-method').textContent = metodosPagoTraducidos[payment.metodo_pago] || payment.metodo_pago;
            
            // Mostrar instrucciones para transferencia si aplica
            if (payment.metodo_pago === 'transferencia' && payment.estado !== 'aprobado') {
                document.getElementById('payment-instructions').innerHTML = `
                    <h2>Instrucciones de Pago</h2>
                    <p>Tu pedido está pendiente de pago. Por favor realiza la transferencia con los siguientes datos:</p>
                    <div class="bank-details">
                        <p><strong>Nombre:</strong> FERREMAS SpA</p>
                        <p><strong>RUT:</strong> 76.123.456-7</p>
                        <p><strong>Banco:</strong> Banco de Chile</p>
                        <p><strong>Tipo de Cuenta:</strong> Cuenta Corriente</p>
                        <p><strong>N° de Cuenta:</strong> 123-45678-90</p>
                        <p><strong>Email:</strong> pagos@ferremas.cl</p>
                        <p><strong>Monto:</strong> $${order.total.toLocaleString('es-CL')}</p>
                        <p><strong>Asunto:</strong> Pedido ${order.codigo}</p>
                    </div>
                    <p>Una vez realizada la transferencia, envía el comprobante a pagos@ferremas.cl indicando el número de pedido.</p>
                `;
            }
        } else {
            document.getElementById('payment-method').textContent = 'No disponible';
        }
        
        // Total
        document.getElementById('order-total').textContent = `$${order.total.toLocaleString('es-CL')}`;
        
        // Detalles de entrega
        const deliveryInfoContainer = document.getElementById('delivery-info');
        
        if (order.tipo_entrega === 'retiro_tienda') {
            let sucursalInfo = 'No disponible';
            
            if (order.sucursal_retiro) {
                sucursalInfo = `${order.sucursal_retiro.nombre} - ${order.sucursal_retiro.direccion}, ${order.sucursal_retiro.ciudad}`;
            }
            
            deliveryInfoContainer.innerHTML = `
                <div class="delivery-info">
                    <div class="info-row">
                        <span>Método de entrega:</span>
                        <span>Retiro en tienda</span>
                    </div>
                    <div class="info-row">
                        <span>Sucursal:</span>
                        <span>${sucursalInfo}</span>
                    </div>
                    <div class="info-row">
                        <span>Horario de atención:</span>
                        <span>${order.sucursal_retiro ? order.sucursal_retiro.horario || 'Lunes a Viernes: 9:00 - 18:00, Sábado: 9:00 - 14:00' : 'Lunes a Viernes: 9:00 - 18:00, Sábado: 9:00 - 14:00'}</span>
                    </div>
                </div>
                <p class="delivery-note">Te notificaremos por email cuando tu pedido esté listo para ser retirado.</p>
            `;
        } else {
            deliveryInfoContainer.innerHTML = `
                <div class="delivery-info">
                    <div class="info-row">
                        <span>Método de entrega:</span>
                        <span>Despacho a domicilio</span>
                    </div>
                    <div class="info-row">
                        <span>Dirección:</span>
                        <span>${order.direccion_entrega}</span>
                    </div>
                    <div class="info-row">
                        <span>Ciudad:</span>
                        <span>${order.ciudad_entrega}</span>
                    </div>
                    <div class="info-row">
                        <span>Región:</span>
                        <span>${order.region_entrega}</span>
                    </div>
                    <div class="info-row">
                        <span>Tiempo estimado de entrega:</span>
                        <span>3-5 días hábiles</span>
                    </div>
                </div>
                <p class="delivery-note">Te notificaremos por email cuando tu pedido sea despachado.</p>
            `;
        }
    } catch (error) {
        console.error('Error al cargar detalles del pedido:', error);
        
        // Mostrar mensaje de error
        document.querySelector('.confirmation-container').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Ocurrió un error</h2>
                <p>No pudimos cargar los detalles de tu pedido. Por favor intenta nuevamente más tarde.</p>
                <a href="../index.html" class="btn primary-btn">Volver a la Página Principal</a>
            </div>
        `;
    }
}