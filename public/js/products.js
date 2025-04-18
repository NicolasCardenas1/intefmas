document.addEventListener('DOMContentLoaded', function() {
    fetchCategories();
    fetchFeaturedProducts();
    fetchBrands();
});

// Función para obtener categorías desde la API
async function fetchCategories() {
    try {
        const response = await fetch('/api/v1/categorias');
        const categories = await response.json();
        
        displayCategories(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
    }
}

// Función para obtener productos destacados desde la API
async function fetchFeaturedProducts() {
    try {
        const response = await fetch('/api/v1/productos?destacado=true');
        const products = await response.json();
        
        displayFeaturedProducts(products);
    } catch (error) {
        console.error('Error al obtener productos destacados:', error);
    }
}

// Función para obtener marcas desde la API
async function fetchBrands() {
    try {
        const response = await fetch('/api/v1/marcas');
        const brands = await response.json();
        
        displayBrands(brands);
    } catch (error) {
        console.error('Error al obtener marcas:', error);
    }
}

// Función para mostrar categorías en la página
function displayCategories(categories) {
    const categoriesContainer = document.getElementById('categories-container');
    
    if (!categoriesContainer) return;
    
    // Limitar a 4 categorías para la página principal
    const displayCategories = categories.slice(0, 4);
    
    categoriesContainer.innerHTML = '';
    
    if (displayCategories.length === 0) {
        categoriesContainer.innerHTML = '<p>No hay categorías disponibles</p>';
        return;
    }
    
    displayCategories.forEach(category => {
        categoriesContainer.innerHTML += `
            <div class="category-card">
                <img src="${category.imagen || 'https://via.placeholder.com/300x200?text=Categoría'}" alt="${category.nombre}">
                <div class="category-card-content">
                    <h3>${category.nombre}</h3>
                    <p>${category.descripcion || 'Sin descripción'}</p>
                    <a href="pages/products.html?categoria=${category.id}" class="btn">Ver productos</a>
                </div>
            </div>
        `;
    });
}

// Función para mostrar productos destacados en la página
function displayFeaturedProducts(products) {
    const productsContainer = document.getElementById('featured-products-container');
    
    if (!productsContainer) return;
    
    // Limitar a 4 productos para la página principal
    const displayProducts = products.slice(0, 4);
    
    productsContainer.innerHTML = '';
    
    if (displayProducts.length === 0) {
        productsContainer.innerHTML = '<p>No hay productos destacados disponibles</p>';
        return;
    }
    
    displayProducts.forEach(product => {
        productsContainer.innerHTML += `
            <div class="product-card">
                <img src="${product.imagen || 'https://via.placeholder.com/300x200?text=Producto'}" alt="${product.nombre}">
                <div class="product-card-content">
                    <h3>${product.nombre}</h3>
                    <p>${product.descripcion || 'Sin descripción'}</p>
                    <div class="product-card-price">$${product.precio.toLocaleString('es-CL')}</div>
                    <div class="product-card-actions">
                        <a href="pages/product-detail.html?id=${product.id}" class="btn">Ver detalles</a>
                        <button class="add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Añadir
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Agregar evento para añadir al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId, products);
        });
    });
}

// Función para mostrar marcas en la página
function displayBrands(brands) {
    const brandsContainer = document.getElementById('brands-container');
    
    if (!brandsContainer) return;
    
    // Limitar a 4 marcas para la página principal
    const displayBrands = brands.slice(0, 4);
    
    brandsContainer.innerHTML = '';
    
    if (displayBrands.length === 0) {
        brandsContainer.innerHTML = '<p>No hay marcas disponibles</p>';
        return;
    }
    
    displayBrands.forEach(brand => {
        brandsContainer.innerHTML += `
            <div class="brand-card">
                <img src="${brand.logo || 'https://via.placeholder.com/150x150?text=Logo'}" alt="${brand.nombre}">
                <div class="brand-card-content">
                    <h3>${brand.nombre}</h3>
                    <p>${brand.descripcion || 'Sin descripción'}</p>
                </div>
            </div>
        `;
    });
}

// Función para añadir productos al carrito
function addToCart(productId, productsArray) {
    const product = productsArray.find(product => product.id == productId);
    
    if (!product) return;
    
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cartItems.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
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