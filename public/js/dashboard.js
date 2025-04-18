document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación y rol
    checkAdminAuth();
    
    // Cargar datos del dashboard
    loadDashboardData();
    
    // Evento para cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});

// Función para verificar autenticación de administrador
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || userInfo.rol !== 'administrador') {
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
async function loadDashboardData() {
    try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // Cargar estadísticas
        await loadStats(token);
        
        // Cargar pedidos recientes
        await loadRecentOrders(token);
        
        // Cargar productos con stock bajo
        await loadLowStockProducts(token);
    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
    }
}

// Función para cargar estadísticas
async function loadStats(token) {
    try {
        const response = await fetch('/api/v1/admin/stats', {
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
        document.getElementById('new-orders').textContent = data.newOrders;
        document.getElementById('new-customers').textContent = data.newCustomers;
        document.getElementById('total-products').textContent = data.totalProducts;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        
        // Valores de prueba para demostración
        document.getElementById('daily-sales').textContent = '$1,250,000';
        document.getElementById('new-orders').textContent = '12';
        document.getElementById('new-customers').textContent = '5';
        document.getElementById('total-products').textContent = '347';
    }
}

// Función para cargar pedidos recientes
async function loadRecentOrders(token) {
    try {
        const response = await fetch('/api/v1/admin/orders/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener pedidos recientes');
        }
        
        const orders = await response.json();
        
        renderRecentOrders(orders);
    } catch (error) {
        console.error('Error al cargar pedidos recientes:', error);
        
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
                estado: 'aprobado'
            },
            {
                id: 3,
                codigo: 'ORD-210614-003',
                cliente: { nombre: 'Carlos Rodríguez' },
                fecha_pedido: '2025-04-14T16:45:00',
                total: 235000,
                estado: 'en_preparacion'
            },
            {
                id: 4,
                codigo: 'ORD-210614-004',
                cliente: { nombre: 'Ana López' },
                fecha_pedido: '2025-04-14T09:20:00',
                total: 45800,
                estado: 'entregado'
            },
            {
                id: 5,
                codigo: 'ORD-210613-005',
                cliente: { nombre: 'Pablo Martínez' },
                fecha_pedido: '2025-04-13T15:10:00',
                total: 189000,
                estado: 'rechazado'
            }
        ];
        
        renderRecentOrders(mockOrders);
    }
}

// Función para renderizar pedidos recientes
function renderRecentOrders(orders) {
    const tableBody = document.getElementById('recent-orders');
    
    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay pedidos recientes</td></tr>';
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
           },
           {
               id: 4,
               Product: {
                   codigo: 'FER-45678',
                   nombre: 'Amoladora Angular Dewalt'
               },
               stock: 1,
               stock_minimo: 5
           },
           {
               id: 5,
               Product: {
                   codigo: 'FER-56789',
                   nombre: 'Lijadora Orbital Black & Decker'
               },
               stock: 0,
               stock_minimo: 3
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