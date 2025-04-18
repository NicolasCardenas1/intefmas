document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay un token almacenado para determinar si el usuario está logueado
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    updateNavigation(token, userInfo);
    updateCartCount();
});

// Función para actualizar la navegación según el estado de autenticación
function updateNavigation(token, userInfo) {
    const userActions = document.querySelector('.user-actions');
    
    if (token && userInfo) {
        // Usuario autenticado
        userActions.innerHTML = `
            <span class="user-greeting">Hola, ${userInfo.nombre}</span>
            <div class="dropdown">
                <button class="btn dropdown-toggle">Mi Cuenta</button>
                <div class="dropdown-content">
                    <a href="pages/profile.html">Perfil</a>
                    <a href="pages/orders.html">Mis Pedidos</a>
                    ${userInfo.rol === 'administrador' ? '<a href="pages/admin/dashboard.html">Panel Admin</a>' : ''}
                    ${userInfo.rol === 'vendedor' ? '<a href="pages/vendor/dashboard.html">Panel Vendedor</a>' : ''}
                    ${userInfo.rol === 'bodeguero' ? '<a href="pages/warehouse/dashboard.html">Panel Bodega</a>' : ''}
                    ${userInfo.rol === 'contador' ? '<a href="pages/accounting/dashboard.html">Panel Contador</a>' : ''}
                    <a href="#" id="logout-btn">Cerrar Sesión</a>
                </div>
            </div>
            <a href="pages/cart.html" class="cart-icon"><i class="fas fa-shopping-cart"></i> <span id="cart-count">0</span></a>
        `;
        
        // Agregar evento de cierre de sesión
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    } else {
        // Usuario no autenticado
        userActions.innerHTML = `
            <a href="pages/login.html" class="btn login">Iniciar Sesión</a>
            <a href="pages/register.html" class="btn register">Registrarse</a>
            <a href="pages/cart.html" class="cart-icon"><i class="fas fa-shopping-cart"></i> <span id="cart-count">0</span></a>
        `;
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = 'index.html';
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartCount = document.getElementById('cart-count');
    
    if (cartCount) {
        cartCount.textContent = cartItems.reduce((total, item) => total + item.quantity, 0);
    }
}