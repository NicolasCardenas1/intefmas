document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación y rol
    checkVendorAuth();
    
    // Cargar datos del dashboard
    loadVendorDashboardData();
    
    // Evento para cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});

// Función para verificar autenticación de vendedor
function checkVendorAuth() {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || userInfo.rol !== 'vendedor') {
        // Redirigir a login
        window.location.href = '../pages/login.html';
        return;
    }
    
    // Actualizar nombre de usuario
    document.querySelector('.user-name').textContent = userInfo.nombre;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '../pages/login.html';
}

// Función para cargar datos del dashboard
async function loadVendorDashboardData() {
    try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // Cargar estadísticas
        await loadVendorStats(token);
        
        // Cargar pedidos pendientes
        await loadPendingOrders(token);
    } catch (error) {
        console.error('Error al cargar datos del dashboard de vendedor:', error);
    }
}

// Función para cargar estadísticas de vendedor
async function loadVendorStats(token) {
    try {
        const response = await fetch('/api/v1/vendedor/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener estadísticas');
        }
        
        const data = await response.json();
        
        // Actualizar estadísticas en la UI
        document.getElementById('daily-sales').textContent = `$${data.dailySales.toLocaleString('es-CL')}`;
        document.getElementById('pending-orders').textContent = data.pendingOrders;
        document.getElementById('completed-orders').textContent = data.completedOrders;
    } catch (error) {
        console.error('Error al cargar estadísticas de vendedor:', error);
        
        // Valores de prueba para demostración
        document.getElementById('daily-sales').textContent = '$750,000';
        document.getElementById('pending-orders').textContent = '8';
        document.getElementById('completed-orders').textContent = '15';
    }
}

// Función para cargar pedidos pendientes
async function loadPendingOrders(token) {
    try {
        const response = await fetch('/api/v1/vendedor/pedidos/pendientes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener pedidos pendientes');
        }
        
        const orders = await response.json();
        
        renderPendingOrders(orders);
    } catch (error) {
        console.error('Error al cargar pedidos pendientes:', error);
        
        // Datos de prueba para demostración
        const mockOrders = [
            {
                id: 1,
                codigo: 'ORD-210615-001',
                cliente: { nombre: 'Juan Pérez' },
                fecha_pedido: '2025-04-15T14:30:00',
                total: 125000,
                estado: 'pendiente'
            },
            {
                id: 2,
                codigo: 'ORD-210615-002',
                cliente: { nombre: 'María González' },
                fecha_pedido: '2025-04-15T10:15:00',
                total: 78500,
                estado: 'pendiente'
            },
            {
                id: 3,
                codigo: 'ORD-210614-003',
                cliente: { nombre: 'Carlos Rodríguez' },
                fecha_pedido: '2025-04-14T16:45:00',
                total: 235000,
                estado: 'aprobado'
            }
        ];
        
        renderPendingOrders(mockOrders);
    }
}

// Función para renderizar pedidos pendientes
function renderPendingOrders(orders) {
    const tableBody = document.getElementById('pending-orders-table');
    
    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay pedidos pendientes</td></tr>';
        return;
    }
    
    let html = '';
    
    orders.forEach(order => {
        // Formatear fecha
        const orderDate = new Date(order.fecha_pedido);
        const formattedDate = orderDate.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
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
        
        // Clase CSS para el estado
        const estadoClases = {
            'pendiente': 'badge-pending',
            'aprobado': 'badge-approved',
            'rechazado': 'badge-rejected',
            'en_preparacion': 'badge-pending',
            'listo_para_entrega': 'badge-approved',
            'en_camino': 'badge-pending',
            'entregado': 'badge-approved',
            'cancelado': 'badge-rejected'
        };
        
        html += `
            <tr>
                <td>${order.codigo}</td>
                <td>${order.cliente.nombre}</td>
                <td>${formattedDate}</td>
                <td>$${order.total.toLocaleString('es-CL')}</td>
                <td><span class="badge-status ${estadoClases[order.estado]}">${estadosTraducidos[order.estado]}</span></td>
                <td>
                    <a href="orders.html?id=${order.id}" class="action-btn view"><i class="fas fa-eye"></i></a>
                    <a href="orders.html?id=${order.id}&edit=true" class="action-btn edit"><i class="fas fa-edit"></i></a>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}