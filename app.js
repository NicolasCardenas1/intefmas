const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Configuración de variables de entorno
require('dotenv').config();

// Importar Swagger
const { swaggerUi, swaggerDocs } = require('./swagger');

// Importar modelos
const models = require('./models');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const categoriesRoutes = require('./routes/categories.routes');
const brandsRoutes = require('./routes/brands.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const ordersRoutes = require('./routes/orders.routes');
const branchRoutes = require('./routes/branches.routes');

// Inicialización de la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Configuración de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/productos', productRoutes);
app.use('/api/v1/categorias', categoriesRoutes);
app.use('/api/v1/marcas', brandsRoutes);
app.use('/api/v1/inventario', inventoryRoutes);
app.use('/api/v1/pedidos', ordersRoutes);
app.use('/api/v1/sucursales', branchRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de FERREMAS - Sistema de Gestión Comercial');
});

// Ruta de prueba
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'API de FERREMAS funcionando correctamente' });
});

// Sincronización con la base de datos y arranque del servidor
const { sequelize } = require('./config/database');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // En desarrollo, sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.');
    
    app.listen(PORT, () => {
      console.log('Servidor corriendo en http://localhost:' + PORT);
      console.log('Documentación Swagger disponible en http://localhost:' + PORT + '/api-docs');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

startServer();

module.exports = app;