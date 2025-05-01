const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const { verifyToken, isAdmin, isVendedor } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);
router.get('/categoria/:categoriaId', productsController.getProductsByCategory);

// Rutas protegidas (solo admin y vendedor)
router.post('/', [verifyToken, isAdmin], productsController.createProduct);
router.put('/:id', [verifyToken, isAdmin], productsController.updateProduct);
router.delete('/:id', [verifyToken, isAdmin], productsController.deleteProduct);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *         - categoria_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del producto
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del producto
 *         precio:
 *           type: number
 *           format: float
 *           description: Precio unitario del producto
 *         sku:
 *           type: string
 *           description: Código SKU del producto
 *         marca_id:
 *           type: integer
 *           description: ID de la marca del producto
 *         categoria_id:
 *           type: integer
 *           description: ID de la categoría del producto
 *         imagenes:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs de las imágenes del producto
 *         activo:
 *           type: boolean
 *           description: Estado del producto
 */

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: API para gestionar productos
 */

/**
 * @swagger
 * /api/v1/productos:
 *   get:
 *     summary: Obtiene todos los productos
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de registros por página
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: marca
 *         schema:
 *           type: integer
 *         description: Filtrar por marca
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por texto en nombre o descripción
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 */

/**
 * @swagger
 * /api/v1/productos/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /api/v1/productos/categoria/{categoriaId}:
 *   get:
 *     summary: Obtiene productos por categoría
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de registros por página
 *     responses:
 *       200:
 *         description: Lista de productos de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Categoría no encontrada
 */

/**
 * @swagger
 * /api/v1/productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 */

/**
 * @swagger
 * /api/v1/productos/{id}:
 *   put:
 *     summary: Actualiza un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /api/v1/productos/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Producto no encontrado
 */