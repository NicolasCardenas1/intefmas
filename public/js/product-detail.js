document.addEventListener('DOMContentLoaded', function() {
    // Obtener ID del producto desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    
    // Cargar detalles del producto
    loadProductDetails(productId);
});

// Función para cargar detalles del producto
async function loadProductDetails(productId) {
    try {
        const response = await fetch(`/api/v1/productos/${productId}`);
        
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        
        const product = await response.json();
        
        // Actualizar título de la página
        document.title = `${product.nombre} - FERREMAS`;
        
        // Actualizar breadcrumb
        document.getElementById('product-breadcrumb').textContent = product.nombre;
        
        // Renderizar detalles del producto
        renderProductDetails(product);
        
        // Cargar productos relacionados (de la misma categoría)
        loadRelatedProducts(product.categoria_id, productId);
        
    } catch (error) {
        console.error('Error al cargar los detalles del producto:', error);
        document.getElementById('product-detail').innerHTML = `
            <div class="error-message">
                <h3>Producto no encontrado</h3>
                <p>Lo sentimos, el producto que buscas no existe o no está disponible.</p>
                <a href="products.html" class="btn">Ver todos los productos</a>
            </div>
        `;
    }
}

// Función para renderizar detalles del producto
function renderProductDetails(product) {
    // Determinar estado del stock
    let stockStatus = '';
    let stockClass = '';
    
    if (product.Inventories && product.Inventories.length > 0) {
        const totalStock = product.Inventories.reduce((total, inventory) => total + inventory.stock, 0);
        
        if (totalStock > 10) {
            stockStatus = 'En stock';
            stockClass = 'in-stock';
        } else if (totalStock > 0) {
            stockStatus = 'Pocas unidades disponibles';
            stockClass = 'low-stock';
        } else {
            stockStatus = 'Agotado';
            stockClass = 'out-of-stock';
        }
    } else {
        stockStatus = 'Stock no disponible';
        stockClass = 'out-of-stock';
    }
    
    // Renderizar HTML
    const productDetailElement = document.getElementById('product-detail');
    
    productDetailElement.innerHTML = `
        <div class="product-image">
            <img src="${product.imagen || 'https://via.placeholder.com/600x400?text=Producto'}" alt="${product.nombre}">
        </div>
        <div class="product-info">
            <h1>${product.nombre}</h1>
            <div class="product-meta">
                <div class="product-brand">
                    Marca: <a href="products.html?marca=${product.marca_id}">${product.Brand ? product.Brand.nombre : 'No disponible'}</a>
                </div>
                <div class="product-category">
                    Categoría: <a href="products.html?categoria=${product.categoria_id}">${product.Category ? product.Category.nombre : 'No disponible'}</a>
                </div>
                <div class="product-code">
                    Código: ${product.codigo || 'No disponible'}
                </div>
            </div>
            <div class="product-description">
                ${product.descripcion || 'No hay descripción disponible para este producto.'}
            </div>
            <div class="product-price">
                $${product.precio.toLocaleString('es-CL')}
            </div>
            <div class="product-stock ${stockClass}">
                ${stockStatus}
            </div>
            <div class="product-actions">
                <div class="quantity-control">
                    <button id="decrease-quantity">-</button>
                    <input type="number" id="product-quantity" value="1" min="1" max="99">
                    <button id="increase-quantity">+</button>
                </div>
                <button id="add-to-cart" class="add-to-cart-btn" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Añadir al carrito
                </button>
            </div>
            ${product.features ? `
                <div class="product-features">
                    <h3>Características</h3>
                    <ul class="features-list">
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    
// Eventos para controles de cantidad
const quantityInput = document.getElementById('product-quantity');
const decreaseBtn = document.getElementById('decrease-quantity');
const increaseBtn = document.getElementById('increase-quantity');

decreaseBtn.addEventListener('click', function() {
    if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
    }
});

increaseBtn.addEventListener('click', function() {
    if (quantityInput.value < 99) {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    }
});

// Evento para añadir al carrito
const addToCartBtn = document.getElementById('add-to-cart');

addToCartBtn.addEventListener('click', function() {
    const quantity = parseInt(quantityInput.value);
    addToCart(product, quantity);
});
}