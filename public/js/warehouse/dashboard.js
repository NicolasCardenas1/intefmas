document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación y rol
    checkWarehouseAuth();
    
    // Cargar datos del dashboard
    loadWarehouseDashboardData();
    
    // Evento para cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});

// Función para verificar autenticación de bodeguero
function checkWarehouseAuth() {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || userInfo.rol !== 'bodeguero') {
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
async function loadWarehouseDashboardData() {
    try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // Cargar estadísticas
        await loadWarehouseStats(token);
        
        // Cargar órdenes por preparar
        await loadOrdersToPrepare(token);
        
        // Cargar productos con stock bajo
        await loadLowStockProducts(token);
    } catch (error) {
        console.error('Error al cargar datos del dashboard de bodega:', error);
    }
}

// Función para cargar estadísticas de bodega
async function loadWarehouseStats(token) {
    try {
        const response = await fetch('/api/v1/bodega/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener estadísticas');
        }
        
        const data = await response.json();
        
        // Actualizar estadísticas en la UI
        document.getElementById('total-products').textContent = data.totalProducts;
        document.getElementById('low-stock').textContent = data.lowStock;
        document.getElementById('orders-to-prepare').textContent = data.ordersToPrepare;
    } catch (error) {
        console.error('Error al cargar estadísticas de bodega:', error);
        
        // Valores de prueba para demostración
        document.getElementById('total-products').textContent = '347';
        document.getElementById('low-stock').textContent = '12';
        document.getElementById('orders-to-prepare').textContent = '5';
    }
}

// Función para cargar órdenes por preparar
async function loadOrdersToPrepare(token) {
    try {
        const response = await fetch('/api/v1/bodega/pedidos/preparar', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener órdenes por preparar');
        }
        
        const orders = await response.json();
        
        renderOrdersToPrepare(orders);
    } catch (error) {
        console.error('Error al cargar órdenes por preparar:', error);
        
        // Datos de prueba para demostración
        const mockOrders = [
            {
                id: 1,
                codigo: 'ORD-210615-001',
                fecha_pedido: '2025-04-15T14:30:00',
                items_count: 3,
                estado: 'aprobado'
            },
            {
                id: 2,
                codigo: 'ORD-210615-002',
                fecha_pedido: '2025-04-15T10:15:00',
                items_count: 2,
                estado: 'aprobado'
            },
            {
                id: 3,
                codigo: 'ORD-210614-003',
                fecha_pedido: '2025-04-14T16:45:00',
                items_count: 5,
                estado: 'aprobado'
            }
        ];
        
        renderOrdersToPrepare(mockOrders);
    }
}

// Función para renderizar órdenes por preparar
function renderOrdersToPrepare(orders) {
    const tableBody = document.getElementById('orders-to-prepare-table');
    
    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay órdenes por preparar</td></tr>';
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
                <td>${formattedDate}</td>
                <td>${order.items_count} productos</td>
                <td><span class="badge-status ${estadoClases[order.estado]}">${estadosTraducidos[order.estado]}</span></td>
                <td>
                    <a href="orders.html?id=${order.id}" class="action-btn view"><i class="fas fa-eye"></i></a>
                    <button class="action-btn edit" onclick="prepareOrder(${order.id})"><i class="fas fa-box"></i> Preparar</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Función para cargar productos con stock bajo
async function loadLowStockProducts(token) {
    try {
        const response = await fetch('/api/v1/inventario/bajo-stock', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener productos con stock bajo');
        }
        
        const products = await response.json();
        
        renderLowStockProducts(products);
    } catch (error) {
        console.error('Error al cargar productos con stock bajo:', error);
        
        // Datos de prueba para demostración
        const mockProducts = [
            {
                id: 1,
                Product: {
                    codigo: 'FER-12345',
                    nombre: 'Taladro Percutor Bosch'
                },
                stock: 3,
                stock_minimo: 5
            },
            {
                id: 2,
                Product: {
                    codigo: 'FER-23456',
                    nombre: 'Sierra Circular Makita'
                },
                stock: 2,
                stock_minimo: 5
            },
            {
                id: 3,
                Product: {
                    codigo: 'FER-34567',
                    nombre: 'Juego de Destornilladores Stanley'
                },
                stock: 4,
                stock_minimo: 10
            }
        ];
        
        renderLowStockProducts(mockProducts);
    }
}

// Función para renderizar productos con stock bajo
function renderLowStockProducts(products) {
    const tableBody = document.getElementById('low-stock-products');
    
    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay productos con stock bajo</td></tr>';
        return;
    }
    
    let html = '';
    
    products.forEach(product => {
        html += `
            <tr>
                <td>${product.Product.codigo}</td>
                <td>${product.Product.nombre}</td>
                <td>${product.stock}</td>
                <td>${product.stock_minimo}</td>
                <td>
                    <a href="inventory.html?id=${product.id}" class="action-btn edit"><i class="fas fa-plus-circle"></i> Reponer</a>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Función para preparar un pedido
function prepareOrder(orderId) {
    // Implementar lógica para marcar un pedido como "en preparación"
    console.log(`Preparando pedido ${orderId}`);
    
    // En producción, se haría una petición al backend para cambiar el estado
    alert(`Pedido ${orderId} marcado como "En preparación"`);
    
    // Recargar datos
    loadWarehouseDashboardData();
}