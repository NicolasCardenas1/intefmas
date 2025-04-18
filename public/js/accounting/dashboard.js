document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación y rol
    checkAccountingAuth();
    
    // Cargar datos del dashboard
    loadAccountingDashboardData();
    
    // Evento para cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Evento para cambiar periodo del gráfico
    document.getElementById('chart-period').addEventListener('change', function() {
        // Implementar cambio de periodo del gráfico
        console.log(`Periodo cambiado a: ${this.value}`);
        loadSalesChart(this.value);
    });
});

// Función para verificar autenticación de contador
function checkAccountingAuth() {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || userInfo.rol !== 'contador') {
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
async function loadAccountingDashboardData() {
    try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // Cargar estadísticas
        await loadAccountingStats(token);
        
        // Cargar pagos pendientes
        await loadPendingPayments(token);
        
        // Cargar gráfico de ventas
        loadSalesChart('month');
    } catch (error) {
        console.error('Error al cargar datos del dashboard de contabilidad:', error);
    }
}

// Función para cargar estadísticas de contabilidad
async function loadAccountingStats(token) {
    try {
        const response = await fetch('/api/v1/contador/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener estadísticas');
        }
        
        const data = await response.json();
        
        // Actualizar estadísticas en la UI
        document.getElementById('monthly-sales').textContent = `$${data.monthlySales.toLocaleString('es-CL')}`;
        document.getElementById('pending-payments').textContent = data.pendingPayments;
        document.getElementById('issued-invoices').textContent = data.issuedInvoices;
    } catch (error) {
        console.error('Error al cargar estadísticas de contabilidad:', error);
        
        // Valores de prueba para demostración
        document.getElementById('monthly-sales').textContent = '$15,750,000';
        document.getElementById('pending-payments').textContent = '12';
        document.getElementById('issued-invoices').textContent = '85';
    }
}

// Función para cargar pagos pendientes
async function loadPendingPayments(token) {
    try {
        const response = await fetch('/api/v1/contador/pagos/pendientes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener pagos pendientes');
        }
        
        const payments = await response.json();
        
        renderPendingPayments(payments);
    } catch (error) {
        console.error('Error al cargar pagos pendientes:', error);
        
        // Datos de prueba para demostración
        const mockPayments = [
            {
                id: 1,
                pedido: { codigo: 'ORD-210615-001' },
                cliente: { nombre: 'Juan Pérez' },
                monto: 125000,
                metodo_pago: 'transferencia',
                fecha_pago: '2025-04-15T14:30:00'
            },
            {
                id: 2,
                pedido: { codigo: 'ORD-210615-002' },
                cliente: { nombre: 'María González' },
                monto: 78500,
                metodo_pago: 'transferencia',
                fecha_pago: '2025-04-15T10:15:00'
            },
            {
                id: 3,
                pedido: { codigo: 'ORD-210614-003' },
                cliente: { nombre: 'Carlos Rodríguez' },
                monto: 235000,
                metodo_pago: 'transferencia',
                fecha_pago: '2025-04-14T16:45:00'
            }
        ];
        
        renderPendingPayments(mockPayments);
    }
}

// Función para renderizar pagos pendientes
function renderPendingPayments(payments) {
    const tableBody = document.getElementById('pending-payments-table');
    
    if (payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay pagos pendientes</td></tr>';
        return;
    }
    
    let html = '';
    
    payments.forEach(payment => {
        // Formatear fecha
        const paymentDate = new Date(payment.fecha_pago);
        const formattedDate = paymentDate.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Traducir método de pago
        const metodosTraducidos = {
            'debito': 'Tarjeta de Débito',
            'credito': 'Tarjeta de Crédito',
            'transferencia': 'Transferencia Bancaria'
        };
        
        html += `
            <tr>
                <td>${payment.pedido.codigo}</td>
                <td>${payment.cliente.nombre}</td>
                <td>$${payment.monto.toLocaleString('es-CL')}</td>
                <td>${metodosTraducidos[payment.metodo_pago]}</td>
                <td>${formattedDate}</td>
                <td>
                    <a href="payments.html?id=${payment.id}" class="action-btn view"><i class="fas fa-eye"></i></a>
                    <button class="action-btn approve" onclick="approvePayment(${payment.id})"><i class="fas fa-check"></i> Aprobar</button>
                    <button class="action-btn reject" onclick="rejectPayment(${payment.id})"><i class="fas fa-times"></i> Rechazar</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Función para aprobar un pago
function approvePayment(paymentId) {
    // Implementar lógica para aprobar un pago
    console.log(`Aprobando pago ${paymentId}`);
    
    // En producción, se haría una petición al backend para cambiar el estado
    alert(`Pago ${paymentId} aprobado correctamente`);
    
    // Recargar datos
    loadAccountingDashboardData();
}

// Función para rechazar un pago
function rejectPayment(paymentId) {
    // Implementar lógica para rechazar un pago
    console.log(`Rechazando pago ${paymentId}`);
    
    // En producción, se haría una petición al backend para cambiar el estado
    alert(`Pago ${paymentId} rechazado`);
    
    // Recargar datos
    loadAccountingDashboardData();
}

// Función para cargar gráfico de ventas
function loadSalesChart(period) {
    console.log(`Cargando gráfico de ventas para periodo: ${period}`);
    
    // En una implementación real, aquí se cargarían los datos desde el backend
    // y se utilizaría una biblioteca como Chart.js o D3.js para renderizar el gráfico
    
    const chartContainer = document.getElementById('sales-chart-container');
    
    // Simulación simple para demostración
    chartContainer.innerHTML = `
        <div class="chart-placeholder">
            <i class="fas fa-chart-line"></i>
            <p>Gráfico de ventas para periodo: ${period}</p>
            <div style="width: 100%; height: 200px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                <p style="text-align: center;">Aquí se renderizaría un gráfico real con datos del periodo ${period}</p>
            </div>
        </div>
    `;
}