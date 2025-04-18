document.addEventListener('DOMContentLoaded', function() {
    // Formulario de inicio de sesión
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulario de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Verificar si el usuario ya está autenticado
    const token = localStorage.getItem('token');
    if (token && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        // Redirigir a la página principal si ya está autenticado
        window.location.href = '../index.html';
    }
});

// Manejar inicio de sesión
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    try {
        // Mostrar indicador de carga
        showLoading();
        
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        // Ocultar indicador de carga
        hideLoading();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }
        
        // Guardar token y datos del usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify({
            id: data.user.id,
            nombre: data.user.nombre,
            apellido: data.user.apellido,
            email: data.user.email,
            rol: data.user.rol
        }));
        
        // Redirigir según el rol
        redirectByRole(data.user.rol);
        
    } catch (error) {
        // Ocultar indicador de carga
        hideLoading();
        
        // Mostrar mensaje de error
        errorMessage.textContent = error.message;
        errorMessage.classList.add('show');
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
}

// Manejar registro de usuario
async function handleRegister(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const telefono = document.getElementById('telefono').value;
    const errorMessage = document.getElementById('error-message');
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Las contraseñas no coinciden';
        errorMessage.classList.add('show');
        return;
    }
    
    try {
        // Mostrar indicador de carga
        showLoading();
        
        const response = await fetch('/api/v1/auth/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                apellido,
                email,
                password,
                telefono,
                rol: 'cliente' // Por defecto, todos los registros son clientes
            })
        });
        
        const data = await response.json();
        
        // Ocultar indicador de carga
        hideLoading();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al registrarse');
        }
        
        // Guardar token y datos del usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify({
            id: data.user.id,
            nombre: data.user.nombre,
            apellido: data.user.apellido,
            email: data.user.email,
            rol: data.user.rol
        }));
        
        // Redirigir a la página principal
        window.location.href = '../index.html';
        
    } catch (error) {
        // Ocultar indicador de carga
        hideLoading();
        
        // Mostrar mensaje de error
        errorMessage.textContent = error.message;
        errorMessage.classList.add('show');
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
}

// Función para redirigir según el rol
function redirectByRole(rol) {
    switch (rol) {
        case 'administrador':
            window.location.href = 'admin/dashboard.html';
            break;
        case 'vendedor':
            window.location.href = 'vendor/dashboard.html';
            break;
        case 'bodeguero':
            window.location.href = 'warehouse/dashboard.html';
            break;
        case 'contador':
            window.location.href = 'accounting/dashboard.html';
            break;
        default:
            window.location.href = '../index.html';
    }
}

// Mostrar indicador de carga
function showLoading() {
    const submitButton = document.querySelector('form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    }
}

// Ocultar indicador de carga
function hideLoading() {
    const submitButton = document.querySelector('form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = submitButton.closest('#login-form') ? 'Iniciar Sesión' : 'Registrarse';
    }
}