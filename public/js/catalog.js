document.addEventListener('DOMContentLoaded', function() {
    // Inicializar variables de estado
    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const productsPerPage = 12;
    let selectedCategories = [];
    let selectedBrands = [];
    let priceRange = {
        min: null,
        max: null
    };
    let sortOption = document.getElementById('sort-by').value;

    // Cargar datos iniciales
    loadCategories();
    loadBrands();
    loadProducts();

    // Evento para ordenar productos
    document.getElementById('sort-by').addEventListener('change', function() {
        sortOption = this.value;
        sortProducts();
        renderProducts();
    });

    // Evento para filtrar por precio
    document.getElementById('apply-price').addEventListener('click', function() {
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;
        
        priceRange.min = minPrice !== '' ? parseFloat(minPrice) : null;
        priceRange.max = maxPrice !== '' ? parseFloat(maxPrice) : null;
        
        filterProducts();
        renderProducts();
    });

    // Función para cargar categorías
    async function loadCategories() {
        try {
            const response = await fetch('/api/v1/categorias');
            const categories = await response.json();
            
            renderCategoriesFilter(categories);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            document.getElementById('categories-filter').innerHTML = '<p>Error al cargar categorías</p>';
        }
    }

    // Función para cargar marcas
    async function loadBrands() {
        try {
            const response = await fetch('/api/v1/marcas');
            const brands = await response.json();
            
            renderBrandsFilter(brands);
        } catch (error) {
            console.error('Error al cargar marcas:', error);
            document.getElementById('brands-filter').innerHTML = '<p>Error al cargar marcas</p>';
        }
    }

    // Función para cargar productos
    async function loadProducts() {
        try {
            // Obtener parámetros de URL
            const urlParams = new URLSearchParams(window.location.search);
            const categoryId = urlParams.get('categoria');
            const brandId = urlParams.get('marca');
            const search = urlParams.get('buscar');
            
            // Construir la URL de la API
            let apiUrl = '/api/v1/productos';
            if (categoryId) {
                apiUrl = `/api/v1/productos/categoria/${categoryId}`;
                selectedCategories.push(categoryId);
            } else if (brandId) {
                apiUrl = `/api/v1/productos?marca_id=${brandId}`;
                selectedBrands.push(brandId);
            } else if (search) {
                apiUrl = `/api/v1/productos?buscar=${search}`;
            }
            
            const response = await fetch(apiUrl);
            allProducts = await response.json();
            
            // Aplicar filtros iniciales
            filterProducts();
            renderProducts();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            document.getElementById('products-container').innerHTML = '<p>Error al cargar productos</p>';
            document.getElementById('products-count').textContent = '0 productos encontrados';
        }
    }

    // Función para renderizar filtro de categorías
    function renderCategoriesFilter(categories) {
        const categoriesFilter = document.getElementById('categories-filter');
        
        if (categories.length === 0) {
            categoriesFilter.innerHTML = '<p>No hay categorías disponibles</p>';
            return;
        }
        
        let html = '';
        categories.forEach(category => {
            const isChecked = selectedCategories.includes(category.id.toString());
            html += `
                <div class="filter-option">
                    <input type="checkbox" id="category-${category.id}" value="${category.id}" ${isChecked ? 'checked' : ''}>
                    <label for="category-${category.id}">${category.nombre}</label>
                </div>
            `;
        });
        
        categoriesFilter.innerHTML = html;
        
        // Añadir eventos a los checkboxes
        categories.forEach(category => {
            document.getElementById(`category-${category.id}`).addEventListener('change', function() {
                if (this.checked) {
                    selectedCategories.push(this.value);
                } else {
                    selectedCategories = selectedCategories.filter(id => id !== this.value);
                }
                
                filterProducts();
                renderProducts();
            });
        });
    }

    // Función para renderizar filtro de marcas
    function renderBrandsFilter(brands) {
        const brandsFilter = document.getElementById('brands-filter');
        
        if (brands.length === 0) {
            brandsFilter.innerHTML = '<p>No hay marcas disponibles</p>';
            return;
        }
        
        let html = '';
        brands.forEach(brand => {
            const isChecked = selectedBrands.includes(brand.id.toString());
            html += `
                <div class="filter-option">
                    <input type="checkbox" id="brand-${brand.id}" value="${brand.id}" ${isChecked ? 'checked' : ''}>
                    <label for="brand-${brand.id}">${brand.nombre}</label>
                </div>
            `;
        });
        
        brandsFilter.innerHTML = html;
        
        // Añadir eventos a los checkboxes
        brands.forEach(brand => {
            document.getElementById(`brand-${brand.id}`).addEventListener('change', function() {
                if (this.checked) {
                    selectedBrands.push(this.value);
                } else {
                    selectedBrands = selectedBrands.filter(id => id !== this.value);
                }
                
                filterProducts();
                renderProducts();
            });
        });
    }

    // Función para filtrar productos
    function filterProducts() {
        filteredProducts = allProducts.filter(product => {
            // Filtrar por categoría
            if (selectedCategories.length > 0 && !selectedCategories.includes(product.categoria_id.toString())) {
                return false;
            }
            
            // Filtrar por marca
            if (selectedBrands.length > 0 && !selectedBrands.includes(product.marca_id.toString())) {
                return false;
            }
            
            // Filtrar por precio mínimo
            if (priceRange.min !== null && product.precio < priceRange.min) {
                return false;
            }
            
            // Filtrar por precio máximo
            if (priceRange.max !== null && product.precio > priceRange.max) {
                return false;
            }
            
            return true;
        });
        
        // Ordenar productos
        sortProducts();
        
        // Actualizar el contador de productos
        document.getElementById('products-count').textContent = `${filteredProducts.length} productos encontrados`;
        
        // Resetear página actual
        currentPage = 1;
    }

    // Función para ordenar productos
    function sortProducts() {
        switch (sortOption) {
            case 'name_asc':
                filteredProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'name_desc':
                filteredProducts.sort((a, b) => b.nombre.localeCompare(a.nombre));
                break;
            case 'price_asc':
                filteredProducts.sort((a, b) => a.precio - b.precio);
                break;
            case 'price_desc':
                filteredProducts.sort((a, b) => b.precio - a.precio);
                break;
        }
    }

    // Función para renderizar productos
    function renderProducts() {
        const productsContainer = document.getElementById('products-container');
        
        // Calcular índices para paginación
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        
        // Obtener productos para la página actual
        const productsToShow = filteredProducts.slice(startIndex, endIndex);
        
        if (productsToShow.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">No se encontraron productos con los filtros seleccionados</p>';
            document.getElementById('pagination').innerHTML = '';
            return;
        }
        
        let html = '';
        productsToShow.forEach(product => {
            html += `
                <div class="product-card">
                    <img src="${product.imagen || 'https://via.placeholder.com/300x200?text=Producto'}" alt="${product.nombre}">
                    <div class="product-card-content">
                        <h3>${product.nombre}</h3>
                        <p>${product.descripcion ? (product.descripcion.length > 60 ? product.descripcion.substring(0, 60) + '...' : product.descripcion) : 'Sin descripción'}</p>
                        <div class="product-card-price">$${product.precio.toLocaleString('es-CL')}</div>
                        <div class="product-card-actions">
                            <a href="product-detail.html?id=${product.id}" class="btn">Ver detalles</a>
                            <button class="add-to-cart" data-id="${product.id}">
                                <i class="fas fa-cart-plus"></i> Añadir
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        productsContainer.innerHTML = html;
        
        // Renderizar paginación
        renderPagination();
        
        // Agregar evento para añadir al carrito
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addToCart(productId);
            });
        });
    }

    // Función para renderizar paginación
    function renderPagination() {
        const paginationElement = document.getElementById('pagination');
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        
        if (totalPages <= 1) {
            paginationElement.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Botón Anterior
        html += `<button ${currentPage === 1 ? 'disabled' : ''} id="prev-page">Anterior</button>`;
        
        // Números de página
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        // Botón Siguiente
        html += `<button ${currentPage === totalPages ? 'disabled' : ''} id="next-page">Siguiente</button>`;
        
        paginationElement.innerHTML = html;
        
        // Agregar eventos a los botones de paginación
        document.querySelectorAll('.pagination button[data-page]').forEach(button => {
            button.addEventListener('click', function() {
                currentPage = parseInt(this.getAttribute('data-page'));
                renderProducts();
                // Scroll al inicio de la lista de productos
                document.querySelector('.products-content').scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        // Evento para botón Anterior
        const prevButton = document.getElementById('prev-page');
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    renderProducts();
                    document.querySelector('.products-content').scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        
        // Evento para botón Siguiente
        const nextButton = document.getElementById('next-page');
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderProducts();
                    document.querySelector('.products-content').scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // Función para añadir productos al carrito
    function addToCart(productId) {
        const product = allProducts.find(product => product.id == productId);
        
        if (!product) return;
        
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        // Verificar si el producto ya está en el carrito
        const existingItem = cartItems.find(item => item.id == productId);
        
        if (existingItem) {
            existingItem.quantity += a;
        } else {
            cartItems.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagen,
                quantity: 1
            });
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartCount();
        
        // Mostrar mensaje de éxito
        showToast('Producto añadido al carrito');
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
});