document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Redirigir a login si no está autenticado
        localStorage.setItem('redirectAfterLogin', 'checkout.html');
        window.location.href = 'login.html';
        return;
    }
    
    // Cargar información de carrito y usuario
    loadCartSummary();
    loadBranches();
    
    // Configurar navegación entre pasos
    setupCheckoutSteps();
    
    // Configurar manejo de opciones de entrega
    setupDeliveryOptions();
    
    // Configurar manejo de opciones de pago
    setupPaymentOptions();
    
    // Configurar envío del formulario
    document.getElementById('checkout-form').addEventListener('submit', handleCheckoutSubmit);
});

// Función para cargar resumen de carrito
function loadCartSummary() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems.length === 0) {
        // Redirigir a carrito si está vacío
        window.location.href = 'cart.html';
        return;
    }
    
    // Renderizar resumen del carrito en la barra lateral
    renderCartSummary(cartItems);
    
    // Renderizar resumen del pedido en el paso de confirmación
    renderOrderSummary(cartItems);
}

// Función para cargar sucursales
async function loadBranches() {
    try {
        const response = await fetch('/api/v1/sucursales');
        const branches = await response.json();
        
        const branchSelect = document.getElementById('sucursal');
        
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.id;
            option.textContent = `${branch.nombre} - ${branch.direccion}, ${branch.ciudad}`;
            branchSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar sucursales:', error);
    }
}

// Función para configurar navegación entre pasos
function setupCheckoutSteps() {
    // Botones para avanzar al siguiente paso
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.checkout-step');
            const nextStepId = this.getAttribute('data-next');
            const nextStep = document.querySelector(`.checkout-step[data-step="${nextStepId}"]`);
            
            // Validar el paso actual antes de avanzar
            if (validateStep(currentStep.getAttribute('data-step'))) {
                currentStep.classList.remove('active');
                currentStep.classList.add('completed');
                nextStep.classList.add('active');
                
                // Actualizar resumen en el paso de confirmación
                if (nextStepId === 'confirmation') {
                    updateConfirmationSummaries();
                }
            }
        });
    });
    
    // Botones para volver al paso anterior
    document.querySelectorAll('.back-step').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.checkout-step');
            const prevStepId = this.getAttribute('data-back');
            const prevStep = document.querySelector(`.checkout-step[data-step="${prevStepId}"]`);
            
            currentStep.classList.remove('active');
            prevStep.classList.remove('completed');
            prevStep.classList.add('active');
        });
    });
}

// Función para validar cada paso
function validateStep(stepId) {
    switch (stepId) {
        case 'delivery':
            const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked').value;
            
            if (tipoEntrega === 'retiro_tienda') {
                const sucursal = document.getElementById('sucursal').value;
                if (!sucursal) {
                    alert('Por favor selecciona una sucursal para retiro');
                    return false;
                }
            } else {
                const direccion = document.getElementById('direccion').value;
                const ciudad = document.getElementById('ciudad').value;
                const region = document.getElementById('region').value;
                
                if (!direccion || !ciudad || !region) {
                    alert('Por favor completa todos los campos de dirección de entrega');
                    return false;
                }
            }
            break;
            
        case 'payment':
            // No hay validaciones específicas en este paso
            break;
    }
    
    return true;
}

// Función para configurar opciones de entrega
function setupDeliveryOptions() {
    const tipoEntregaInputs = document.querySelectorAll('input[name="tipo_entrega"]');
    const branchContainer = document.getElementById('branch-select-container');
    const shippingContainer = document.getElementById('shipping-address-container');
    
    tipoEntregaInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'retiro_tienda') {
                branchContainer.style.display = 'block';
                shippingContainer.style.display = 'none';
                
                // Hacer el campo de sucursal requerido
                document.getElementById('sucursal').required = true;
                
                // Hacer los campos de dirección no requeridos
                document.getElementById('direccion').required = false;
                document.getElementById('ciudad').required = false;
                document.getElementById('region').required = false;
            } else {
                branchContainer.style.display = 'none';
                shippingContainer.style.display = 'block';
                
                // Hacer el campo de sucursal no requerido
                document.getElementById('sucursal').required = false;
                
                // Hacer los campos de dirección requeridos
                document.getElementById('direccion').required = true;
                document.getElementById('ciudad').required = true;
                document.getElementById('region').required = true;
            }
        });
    });
}

// Función para configurar opciones de pago
function setupPaymentOptions() {
    const metodoPagoInputs = document.querySelectorAll('input[name="metodo_pago"]');
    const transferenciaContainer = document.getElementById('transferencia-container');
    
    metodoPagoInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === 'transferencia') {
                transferenciaContainer.style.display = 'block';
            } else {
                transferenciaContainer.style.display = 'none';
            }
        });
    });
}

// Función para renderizar resumen del carrito
function renderCartSummary(cartItems) {
    const cartItemsContainer = document.getElementById('cart-items-summary');
    const cartTotalsContainer = document.getElementById('cart-totals-summary');
    
    // Calcular subtotal, IVA, descuento y total
    const subtotal = cartItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
    const iva = subtotal * 0.19; // 19% IVA en Chile
    const descuento = cartItems.length >= 4 ? subtotal * 0.05 : 0; // 5% de descuento si hay 4 o más artículos
    const total = subtotal + iva - descuento;
    
    // Renderizar items
    let itemsHtml = '';
    cartItems.forEach(item => {
        itemsHtml += `
            <div class="cart-item-summary">
                <img src="${item.imagen || 'https://via.placeholder.com/60x60?text=Producto'}" alt="${item.nombre}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.nombre}</div>
                    <div class="item-price">$${item.precio.toLocaleString('es-CL')} c/u</div>
                    <div class="item-quantity">Cantidad: ${item.quantity}</div>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = itemsHtml;
    
    // Renderizar totales
    cartTotalsContainer.innerHTML = `
        <div class="total-row">
            <span>Subtotal</span>
            <span>$${subtotal.toLocaleString('es-CL')}</span>
        </div>
        <div class="total-row">
<span>IVA (19%)</span>
               <span>$${iva.toLocaleString('es-CL')}</span>
           </div>
           ${descuento > 0 ? `
               <div class="total-row">
                   <span>Descuento (5%)</span>
                   <span>-$${descuento.toLocaleString('es-CL')}</span>
               </div>
           ` : ''}
           <div class="total-row final">
               <span>Total</span>
               <span>$${total.toLocaleString('es-CL')}</span>
           </div>
       `;
}

// Función para renderizar resumen del pedido en el paso de confirmación
function renderOrderSummary(cartItems) {
   const orderItemsContainer = document.getElementById('order-items');
   const orderTotalsContainer = document.getElementById('order-totals');
   
   // Calcular subtotal, IVA, descuento y total
   const subtotal = cartItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
   const iva = subtotal * 0.19; // 19% IVA en Chile
   const descuento = cartItems.length >= 4 ? subtotal * 0.05 : 0; // 5% de descuento si hay 4 o más artículos
   const total = subtotal + iva - descuento;
   
   // Renderizar items
   let itemsHtml = '';
   cartItems.forEach(item => {
       itemsHtml += `
           <div class="order-item">
               <img src="${item.imagen || 'https://via.placeholder.com/50x50?text=Producto'}" alt="${item.nombre}" class="order-item-image">
               <div class="order-item-details">
                   <div class="order-item-name">${item.nombre}</div>
                   <div class="order-item-price">$${item.precio.toLocaleString('es-CL')} c/u</div>
               </div>
               <div class="order-item-quantity">x${item.quantity}</div>
               <div class="order-item-total">$${(item.precio * item.quantity).toLocaleString('es-CL')}</div>
           </div>
       `;
   });
   
   orderItemsContainer.innerHTML = itemsHtml;
   
   // Renderizar totales
   orderTotalsContainer.innerHTML = `
       <div class="total-row">
           <span>Subtotal</span>
           <span>$${subtotal.toLocaleString('es-CL')}</span>
       </div>
       <div class="total-row">
           <span>IVA (19%)</span>
           <span>$${iva.toLocaleString('es-CL')}</span>
       </div>
       ${descuento > 0 ? `
           <div class="total-row">
               <span>Descuento (5%)</span>
               <span>-$${descuento.toLocaleString('es-CL')}</span>
           </div>
       ` : ''}
       <div class="total-row">
           <span>Costo de envío</span>
           <span id="shipping-cost">$0</span>
       </div>
       <div class="total-row final">
           <span>Total</span>
           <span id="final-total">$${total.toLocaleString('es-CL')}</span>
       </div>
   `;
}

// Función para actualizar resúmenes en el paso de confirmación
function updateConfirmationSummaries() {
   // Actualizar resumen de entrega
   const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked').value;
   const deliveryDetailsContainer = document.getElementById('delivery-details');
   
   if (tipoEntrega === 'retiro_tienda') {
       const sucursalSelect = document.getElementById('sucursal');
       const sucursalText = sucursalSelect.options[sucursalSelect.selectedIndex].text;
       
       deliveryDetailsContainer.innerHTML = `
           <p><strong>Tipo de entrega:</strong> Retiro en tienda</p>
           <p><strong>Sucursal:</strong> ${sucursalText}</p>
       `;
       
       // Actualizar costo de envío
       document.getElementById('shipping-cost').textContent = '$0';
   } else {
       const direccion = document.getElementById('direccion').value;
       const ciudad = document.getElementById('ciudad').value;
       const region = document.getElementById('region').value;
       
       deliveryDetailsContainer.innerHTML = `
           <p><strong>Tipo de entrega:</strong> Despacho a domicilio</p>
           <p><strong>Dirección:</strong> ${direccion}</p>
           <p><strong>Ciudad:</strong> ${ciudad}</p>
           <p><strong>Región:</strong> ${region}</p>
       `;
       
       // Actualizar costo de envío (5000 para despacho a domicilio)
       document.getElementById('shipping-cost').textContent = '$5.000';
       
       // Actualizar total final
       const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
       const subtotal = cartItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
       const iva = subtotal * 0.19;
       const descuento = cartItems.length >= 4 ? subtotal * 0.05 : 0;
       const costoEnvio = 5000;
       const total = subtotal + iva - descuento + costoEnvio;
       
       document.getElementById('final-total').textContent = `$${total.toLocaleString('es-CL')}`;
   }
   
   // Actualizar resumen de pago
   const metodoPago = document.querySelector('input[name="metodo_pago"]:checked').value;
   const paymentDetailsContainer = document.getElementById('payment-details');
   
   if (metodoPago === 'webpay') {
       paymentDetailsContainer.innerHTML = `
           <p><strong>Método de pago:</strong> WebPay (Tarjeta de crédito/débito)</p>
           <p>Al confirmar el pedido, serás redirigido a la página de pago de WebPay.</p>
       `;
   } else {
       const comprobante = document.getElementById('comprobante').value || 'No indicado';
       
       paymentDetailsContainer.innerHTML = `
           <p><strong>Método de pago:</strong> Transferencia Bancaria</p>
           <p><strong>N° de Comprobante:</strong> ${comprobante}</p>
           <p>Tu pedido será procesado una vez que confirmemos el pago.</p>
       `;
   }
}

// Función para manejar el envío del formulario
async function handleCheckoutSubmit(e) {
   e.preventDefault();
   
   // Verificar términos y condiciones
   const termsChecked = document.getElementById('terms').checked;
   if (!termsChecked) {
       alert('Debes aceptar los términos y condiciones para continuar');
       return;
   }
   
   // Obtener datos del formulario
   const formData = new FormData(e.target);
   const tipoEntrega = formData.get('tipo_entrega');
   const metodoPago = formData.get('metodo_pago');
   
   // Obtener items del carrito
   const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
   const subtotal = cartItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
   const iva = subtotal * 0.19;
   const descuento = cartItems.length >= 4 ? subtotal * 0.05 : 0;
   const costoEnvio = tipoEntrega === 'despacho_domicilio' ? 5000 : 0;
   const total = subtotal + iva - descuento + costoEnvio;
   
   // Crear objeto con datos del pedido
   const orderData = {
       tipo_entrega: tipoEntrega,
       items: cartItems.map(item => ({
           producto_id: item.id,
           cantidad: item.quantity
       })),
       subtotal,
       iva,
       descuento,
       costo_envio: costoEnvio,
       total
   };
   
   // Agregar datos según el tipo de entrega
   if (tipoEntrega === 'retiro_tienda') {
       orderData.sucursal_retiro_id = formData.get('sucursal_retiro_id');
   } else {
       orderData.direccion_entrega = formData.get('direccion_entrega');
       orderData.ciudad_entrega = formData.get('ciudad_entrega');
       orderData.region_entrega = formData.get('region_entrega');
   }
   
   try {
       // Mostrar indicador de carga
       document.querySelector('.confirm-order').disabled = true;
       document.querySelector('.confirm-order').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
       
       // Crear pedido
       const token = localStorage.getItem('token');
       const orderResponse = await fetch('/api/v1/pedidos', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify(orderData)
       });
       
       if (!orderResponse.ok) {
           throw new Error('Error al crear el pedido');
       }
       
       const orderResult = await orderResponse.json();
       
       // Procesar pago según el método seleccionado
       if (metodoPago === 'webpay') {
           // Iniciar pago con WebPay
           const paymentResponse = await fetch('/api/v1/pagos/webpay/crear', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify({
                   orderId: orderResult.order.id
               })
           });
           
           if (!paymentResponse.ok) {
               throw new Error('Error al iniciar el pago');
           }
           
           const paymentResult = await paymentResponse.json();
           
           // Limpiar carrito
           localStorage.removeItem('cartItems');
           
           // Redirigir a página de WebPay
           window.location.href = paymentResult.redirectUrl;
       } else {
           // Registrar pago por transferencia
           const comprobante = formData.get('comprobante') || '';
           
           const paymentResponse = await fetch('/api/v1/pagos/transferencia/registrar', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify({
                   orderId: orderResult.order.id,
                   comprobante,
                   comentarios: 'Pedido realizado via web'
               })
           });
           
           if (!paymentResponse.ok) {
               throw new Error('Error al registrar el pago');
           }
           
           // Limpiar carrito
           localStorage.removeItem('cartItems');
           
           // Redirigir a página de confirmación
           window.location.href = `order-confirmation.html?id=${orderResult.order.id}`;
       }
   } catch (error) {
       console.error('Error en el proceso de checkout:', error);
       alert('Ha ocurrido un error al procesar tu pedido. Por favor intenta nuevamente.');
       
       // Restaurar botón
       document.querySelector('.confirm-order').disabled = false;
       document.querySelector('.confirm-order').textContent = 'Confirmar Pedido';
   }
}