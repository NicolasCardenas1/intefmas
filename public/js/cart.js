document.addEventListener('DOMContentLoaded', function() {
    // Cargar carrito
    renderCart();
});

// Función para renderizar el carrito
function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems.length === 0) {
        // Carrito vacío
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <h2>Tu carrito está vacío</h2>
                <p>Agrega productos para continuar con tu compra</p>
                <a href="products.html" class="btn cta">Ver productos</a>
            </div>
        `;
        return;
    }
    
    // Calcular subtotal, IVA, descuento y total
    const subtotal = cartItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
    const iva = subtotal * 0.19; // 19% IVA en Chile
    const descuento = cartItems.length >= 4 ? subtotal * 0.05 : 0; // 5% de descuento si hay 4 o más artículos
    const total = subtotal + iva - descuento;
    
    // Renderizar carrito con productos
    cartContainer.innerHTML = `
        <div class="cart-items">
            ${cartItems.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.imagen || 'https://via.placeholder.com/100x100?text=Producto'}" alt="${item.nombre}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.nombre}</div>
                        <div class="cart-item-price">$${item.precio.toLocaleString('es-CL')} c/u</div>
                        <div class="cart-item-actions">
                            <div class="cart-item-quantity">
                                <button class="decrease-quantity">-</button>
                                <input type="number" value="${item.quantity}" min="1" max="99" class="item-quantity" readonly>
                                <button class="increase-quantity">+</button>
                            </div>
                            <button class="cart-item-remove"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        $${(item.precio * item.quantity).toLocaleString('es-CL')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="cart-summary">
            <h3>Resumen de la compra</h3>
            <div class="summary-item">
                <span>Subtotal</span>
                <span>$${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div class="summary-item">
                <span>IVA (19%)</span>
                <span>$${iva.toLocaleString('es-CL')}</span>
            </div>
            ${descuento > 0 ? `
                <div class="summary-item">
                    <span>Descuento (5%)</span>
                    <span>-$${descuento.toLocaleString('es-CL')}</span>
                </div>
            ` : ''}
            <div class="summary-item summary-total">
                <span>Total</span>
                <span>$${total.toLocaleString('es-CL')}</span>
            </div>
        </div>
        
        <div class="cart-actions">
            <a href="products.html" class="continue-shopping">
                <i class="fas fa-arrow-left"></i> Seguir comprando
            </a>
            <button class="checkout-btn" id="checkout-btn">
                Proceder al pago <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    // Agregar eventos a los botones de cantidad
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productId = cartItem.getAttribute('data-id');
            updateItemQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productId = cartItem.getAttribute('data-id');
            updateItemQuantity(productId, 1);
        });
    });
    
    // Agregar eventos a los botones de eliminar
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productId = cartItem.getAttribute('data-id');
            removeCartItem(productId);
        });
    });
    
    // Evento para proceder al pago
    document.getElementById('checkout-btn').addEventListener('click', proceedToCheckout);
}

// Función para actualizar la cantidad de un producto
function updateItemQuantity(productId, change) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const itemIndex = cartItems.findIndex(item => item.id == productId);
    
    if (itemIndex === -1) return;
    
    // Actualizar cantidad
    cartItems[itemIndex].quantity += change;
    
    // Verificar límites
    if (cartItems[itemIndex].quantity < 1) {
        cartItems[itemIndex].quantity = 1;
    } else if (cartItems[itemIndex].quantity > 99) {
        cartItems[itemIndex].quantity = 99;
    }
    
    // Guardar cambios
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Actualizar interfaz
    renderCart();
    updateCartCount();
}

// Función para eliminar un producto del carrito
function removeCartItem(productId) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Filtrar el producto a eliminar
    cartItems = cartItems.filter(item => item.id != productId);
    
    // Guardar cambios
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Actualizar interfaz
    renderCart();
    updateCartCount();
    
    // Mostrar mensaje
    showToast('Producto eliminado del carrito');
}

// Función para proceder al pago
function proceedToCheckout() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Si no hay token, redirigir a login
        localStorage.setItem('redirectAfterLogin', 'checkout.html');
        window.location.href = 'login.html';
        return;
    }
    
    // Si hay token, redirigir directamente al checkout
    window.location.href = 'checkout.html';
}

// Función para mostrar notificaciones
function showToast(message) {
    // Crear elemento toast si no existe
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
        
        // Agregar estilos CSS para el toast
        const style = document.createElement('style');
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #333;
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                z-index: 1000;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s, transform 0.3s;
            }
            .toast.show {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    // Ocultar el toast después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}