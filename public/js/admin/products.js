document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación y rol
    checkAdminAuth();
    
    // Variables de estado
    let allProducts = [];
    let currentPage = 1;
    const productsPerPage = 10;
    let filters = {
        categoria: '',
        marca: '',
        estado: ''
    };
    
    // Inicializar componentes
    initializeModal();
    initializeDeleteModal();
    
    // Cargar datos iniciales
    loadCategories();
    loadBrands();
    loadProducts();
    
    // Evento para el botón de agregar producto
    document.getElementById('add-product-btn').addEventListener('click', function() {
        openProductModal();
    });
    
    // Evento para aplicar filtros
    document.getElementById('apply-filters').addEventListener('click', function() {
        applyFilters();
    });
    
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

// Función para inicializar el modal de producto
function initializeModal() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('product-form');
    
    // Cerrar modal
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Enviar formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
}

// Función para inicializar el modal de eliminación
function initializeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const closeBtn = document.getElementById('close-delete-modal');
    const cancelBtn = document.getElementById('cancel-delete-btn');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    
    // Cerrar modal
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Confirmar eliminación
    confirmBtn.addEventListener('click', function() {
        const productId = document.getElementById('delete-product-id').value;
        deleteProduct(productId);
    });
}

// Función para cargar categorías
async function loadCategories() {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/v1/categorias', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener categorías');
        }
        
        const categories = await response.json();
        
        // Llenar selects de categorías
        fillCategorySelects(categories);
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        
        // Categorías de prueba para demostración
        const mockCategories = [
            { id: 1, nombre: 'Herramientas Manuales' },
            { id: 2, nombre: 'Herramientas Eléctricas' },
            { id: 3, nombre: 'Materiales de Construcción' },
            { id: 4, nombre: 'Pinturas y Acabados' },
            { id: 5, nombre: 'Equipos de Seguridad' }
        ];
        
        fillCategorySelects(mockCategories);
    }
}

// Función para llenar selects de categorías
function fillCategorySelects(categories) {
    const categoryFilter = document.getElementById('category-filter');
    const categorySelect = document.getElementById('categoria_id');
    
    // Llenar filtro de categorías
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.nombre;
        categoryFilter.appendChild(option);
    });
    
    // Llenar select del formulario
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.nombre;
        categorySelect.appendChild(option);
    });
}

// Función para cargar marcas
async function loadBrands() {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/v1/marcas', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener marcas');
        }
        
        const brands = await response.json();
        
        // Llenar selects de marcas
        fillBrandSelects(brands);
    } catch (error) {
        console.error('Error al cargar marcas:', error);
        
        // Marcas de prueba para demostración
        const mockBrands = [
            { id: 1, nombre: 'Bosch' },
            { id: 2, nombre: 'Makita' },
            { id: 3, nombre: 'Stanley' },
            { id: 4, nombre: 'Dewalt' },
            { id: 5, nombre: 'Black & Decker' }
        ];
        
        fillBrandSelects(mockBrands);
    }
}

// Función para llenar selects de marcas
function fillBrandSelects(brands) {
    const brandFilter = document.getElementById('brand-filter');
    const brandSelect = document.getElementById('marca_id');
    
    // Llenar filtro de marcas
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = brand.nombre;
        brandFilter.appendChild(option);
    });
    
    // Llenar select del formulario
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = brand.nombre;
        brandSelect.appendChild(option);
    });
}

// Función para cargar productos
async function loadProducts() {
    try {
        const token = localStorage.getItem('token');
        
        let url = '/api/v1/productos';
        
        // Agregar parámetros de filtro si existen
        const queryParams = [];
        
        if (filters.categoria) {
            queryParams.push(`categoria_id=${filters.categoria}`);
        }
        
        if (filters.marca) {
            queryParams.push(`marca_id=${filters.marca}`);
        }
        
        if (filters.estado !== '') {
            queryParams.push(`activo=${filters.estado}`);
        }
        
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }
        
        allProducts = await response.json();
        
        // Renderizar productos
        renderProducts();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        
        // Productos de prueba para demostración
        allProducts = [
            {
                id: 1,
                codigo: 'FER-12345',
                nombre: 'Taladro Percutor Bosch',
                descripcion: 'Taladro percutor profesional de alta potencia',
                precio: 89090,
                imagen: 'https://via.placeholder.com/150',
                categoria_id: 2,
                marca_id: 1,
                destacado: true,
                activo: true,
                Category: { id: 2, nombre: 'Herramientas Eléctricas' },
                Brand: { id: 1, nombre: 'Bosch' }
            },
            {
                id: 2,
                codigo: 'FER-23456',
                nombre: 'Sierra Circular Makita',
                descripcion: 'Sierra circular para cortes precisos',
                precio: 125000,
                imagen: 'https://via.placeholder.com/150',
                categoria_id: 2,
                marca_id: 2,
                destacado: false,
                activo: true,
                Category: { id: 2, nombre: 'Herramientas Eléctricas' },
                Brand: { id: 2, nombre: 'Makita' }
            },
            {
                id: 3,
                codigo: 'FER-34567',
                nombre: 'Juego de Destornilladores Stanley',
                descripcion: 'Set de destornilladores de precisión',
                precio: 25000,
                imagen: 'https://via.placeholder.com/150',
                categoria_id: 1,
                marca_id: 3,
                destacado: false,
                activo: true,
                Category: { id: 1, nombre: 'Herramientas Manuales' },
                Brand: { id: 3, nombre: 'Stanley' }
            },
            {
                id: 4,
                codigo: 'FER-45678',
                nombre: 'Amoladora Angular Dewalt',
                descripcion: 'Amoladora para trabajos pesados',
                precio: 145000,
                imagen: 'https://via.placeholder.com/150',
                categoria_id: 2,
                marca_id: 4,
                destacado: true,
                activo: true,
                Category: { id: 2, nombre: 'Herramientas Eléctricas' },
                Brand: { id: 4, nombre: 'Dewalt' }
            },
            {
                id: 5,
                codigo: 'FER-56789',
                nombre: 'Lijadora Orbital Black & Decker',
                descripcion: 'Lijadora orbital para acabados perfectos',
                precio: 45000,
                imagen: 'https://via.placeholder.com/150',
                categoria_id: 2,
                marca_id: 5,
                destacado: false,
                activo: false,
                Category: { id: 2, nombre: 'Herramientas Eléctricas' },
                Brand: { id: 5, nombre: 'Black & Decker' }
            }
        ];
        
        // Renderizar productos
        renderProducts();
    }
}

// Función para renderizar productos con paginación
function renderProducts() {
    const tableBody = document.getElementById('products-table-body');
    
    // Calcular productos para la página actual
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = allProducts.slice(startIndex, endIndex);
    
    if (allProducts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No se encontraron productos</td></tr>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    let html = '';
    
    productsToShow.forEach(product => {
        html += `
            <tr>
                <td>${product.codigo}</td>
                <td><img src="${product.imagen || 'https://via.placeholder.com/60x60?text=Producto'}" alt="${product.nombre}" class="product-image"></td>
                <td>${product.nombre}</td>
                <td>${product.Category ? product.Category.nombre : 'N/A'}</td>
                <td>${product.Brand ? product.Brand.nombre : 'N/A'}</td>
                <td>$${product.precio.toLocaleString('es-CL')}</td>
                <td><span class="status-badge ${product.activo ? 'status-active' : 'status-inactive'}">${product.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
<button class="action-btn view" onclick="viewProduct(${product.id})"><i class="fas fa-eye"></i></button>
                   <button class="action-btn edit" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                   <button class="action-btn delete" onclick="showDeleteModal(${product.id})"><i class="fas fa-trash"></i></button>
               </td>
           </tr>
       `;
   });
   
   tableBody.innerHTML = html;
   
   // Renderizar paginación
   renderPagination();
}

// Función para renderizar paginación
function renderPagination() {
   const paginationContainer = document.getElementById('pagination');
   const totalPages = Math.ceil(allProducts.length / productsPerPage);
   
   if (totalPages <= 1) {
       paginationContainer.innerHTML = '';
       return;
   }
   
   let html = '';
   
   // Botón anterior
   html += `<button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Anterior</button>`;
   
   // Botones de páginas
   const maxVisiblePages = 5;
   const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
   const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
   
   for (let i = startPage; i <= endPage; i++) {
       html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
   }
   
   // Botón siguiente
   html += `<button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Siguiente</button>`;
   
   paginationContainer.innerHTML = html;
}

// Función para cambiar página
function changePage(page) {
   currentPage = page;
   renderProducts();
   
   // Scroll al inicio de la tabla
   document.querySelector('.table-responsive').scrollIntoView({ behavior: 'smooth' });
}

// Función para aplicar filtros
function applyFilters() {
   filters.categoria = document.getElementById('category-filter').value;
   filters.marca = document.getElementById('brand-filter').value;
   filters.estado = document.getElementById('status-filter').value;
   
   // Reiniciar a la primera página
   currentPage = 1;
   
   // Cargar productos con filtros
   loadProducts();
}

// Función para abrir modal de producto (nuevo)
function openProductModal() {
   const modal = document.getElementById('product-modal');
   const form = document.getElementById('product-form');
   const modalTitle = document.getElementById('modal-title');
   
   // Resetear formulario
   form.reset();
   document.getElementById('product-id').value = '';
   
   // Actualizar título
   modalTitle.textContent = 'Agregar Producto';
   
   // Mostrar modal
   modal.classList.add('active');
}

// Función para ver detalles de un producto
function viewProduct(productId) {
   const product = allProducts.find(p => p.id === productId);
   
   if (!product) return;
   
   // Redirigir a la página de detalle
   window.location.href = `product-detail.html?id=${productId}`;
}

// Función para editar un producto
function editProduct(productId) {
   const product = allProducts.find(p => p.id === productId);
   
   if (!product) return;
   
   const modal = document.getElementById('product-modal');
   const form = document.getElementById('product-form');
   const modalTitle = document.getElementById('modal-title');
   
   // Llenar formulario con datos del producto
   document.getElementById('product-id').value = product.id;
   document.getElementById('codigo').value = product.codigo;
   document.getElementById('nombre').value = product.nombre;
   document.getElementById('descripcion').value = product.descripcion || '';
   document.getElementById('categoria_id').value = product.categoria_id;
   document.getElementById('marca_id').value = product.marca_id;
   document.getElementById('precio').value = product.precio;
   document.getElementById('imagen').value = product.imagen || '';
   document.getElementById('destacado').checked = product.destacado;
   document.getElementById('activo').checked = product.activo;
   
   // Actualizar título
   modalTitle.textContent = 'Editar Producto';
   
   // Mostrar modal
   modal.classList.add('active');
}

// Función para mostrar modal de confirmación de eliminación
function showDeleteModal(productId) {
   const product = allProducts.find(p => p.id === productId);
   
   if (!product) return;
   
   const modal = document.getElementById('delete-modal');
   
   // Guardar ID del producto a eliminar
   document.getElementById('delete-product-id').value = productId;
   
   // Mostrar modal
   modal.classList.add('active');
}

// Función para guardar producto (crear o actualizar)
async function saveProduct() {
   try {
       const token = localStorage.getItem('token');
       const productId = document.getElementById('product-id').value;
       
       // Recoger datos del formulario
       const productData = {
           codigo: document.getElementById('codigo').value,
           nombre: document.getElementById('nombre').value,
           descripcion: document.getElementById('descripcion').value,
           categoria_id: document.getElementById('categoria_id').value,
           marca_id: document.getElementById('marca_id').value,
           precio: parseInt(document.getElementById('precio').value),
           imagen: document.getElementById('imagen').value,
           destacado: document.getElementById('destacado').checked,
           activo: document.getElementById('activo').checked
       };
       
       let response;
       
       if (productId) {
           // Actualizar producto existente
           response = await fetch(`/api/v1/productos/${productId}`, {
               method: 'PUT',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify(productData)
           });
       } else {
           // Crear nuevo producto
           response = await fetch('/api/v1/productos', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify(productData)
           });
       }
       
       if (!response.ok) {
           throw new Error('Error al guardar el producto');
       }
       
       // Cerrar modal
       document.getElementById('product-modal').classList.remove('active');
       
       // Recargar productos
       loadProducts();
       
       // Mostrar mensaje de éxito
       alert(productId ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
   } catch (error) {
       console.error('Error al guardar el producto:', error);
       alert('Error al guardar el producto. Por favor, intenta nuevamente.');
   }
}

// Función para eliminar producto
async function deleteProduct(productId) {
   try {
       const token = localStorage.getItem('token');
       
       const response = await fetch(`/api/v1/productos/${productId}`, {
           method: 'DELETE',
           headers: {
               'Authorization': `Bearer ${token}`
           }
       });
       
       if (!response.ok) {
           throw new Error('Error al eliminar el producto');
       }
       
       // Cerrar modal
       document.getElementById('delete-modal').classList.remove('active');
       
       // Recargar productos
       loadProducts();
       
       // Mostrar mensaje de éxito
       alert('Producto eliminado correctamente');
   } catch (error) {
       console.error('Error al eliminar el producto:', error);
       alert('Error al eliminar el producto. Por favor, intenta nuevamente.');
   }
}