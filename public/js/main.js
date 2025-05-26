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

// Función para verificar si el token ha expirado
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        // Decodificar el payload del JWT
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos
        
        // Verificar si el token ha expirado
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error al verificar token:', error);
        return true; // Si hay error, asumir que expiró
    }
}

// Función para limpiar sesión expirada
function clearExpiredSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    updateNavigation(null, null);
}

// Función para manejar errores de autenticación
function handleAuthError(error) {
    if (error.message.includes('token') || error.message.includes('401') || error.message.includes('expirado')) {
        clearExpiredSession();
        
        // Mostrar mensaje amigable
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        
        // Redirigir a login
        window.location.href = window.location.pathname.includes('pages/') ? 'login.html' : 'pages/login.html';
        return true;
    }
    return false;
}

// Función mejorada para hacer requests con manejo de token
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    // Verificar si el token existe y no ha expirado
    if (!token || isTokenExpired(token)) {
        clearExpiredSession();
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    
    // Agregar token a los headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Si el servidor dice que el token es inválido
        if (response.status === 401) {
            clearExpiredSession();
            throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        }
        
        return response;
    } catch (error) {
        // Manejar errores de red o autenticación
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Error de conexión. Verifica tu conexión a internet.');
        }
        throw error;
    }
}

// Función para verificar autenticación al cargar la página
function checkAuthOnLoad() {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    // Si hay token pero ha expirado, limpiar
    if (token && isTokenExpired(token)) {
        clearExpiredSession();
        return false;
    }
    
    // Actualizar navegación
    updateNavigation(token, userInfo);
    return !!token;
}

// Modificar la función original DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación al cargar
    checkAuthOnLoad();
    
    // Actualizar contador del carrito
    updateCartCount();
    
    // Verificar token cada 5 minutos
    setInterval(() => {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
            clearExpiredSession();
            alert('Tu sesión ha expirado. La página se recargará.');
            window.location.reload();
        }
    }, 5 * 60 * 1000); // 5 minutos
});