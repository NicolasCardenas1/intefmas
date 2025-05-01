const express = require('express');
const router = express.Router();
const brandsController = require('../controllers/brands.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', brandsController.getAllBrands);
router.get('/:id', brandsController.getBrandById);

// Rutas protegidas (solo admin)
router.post('/', [verifyToken, isAdmin], brandsController.createBrand);
router.put('/:id', [verifyToken, isAdmin], brandsController.updateBrand);
router.delete('/:id', [verifyToken, isAdmin], brandsController.deleteBrand);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Marca:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la marca
 *         nombre:
 *           type: string
 *           description: Nombre de la marca
 *         descripcion:
 *           type: string
 *           description: Descripción de la marca
 *         logo:
 *           type: string
 *           description: URL del logo de la marca
 */

/**
 * @swagger
 * tags:
 *   name: Marcas
 *   description: API para gestionar marcas
 */

/**
 * @swagger
 * /api/v1/marcas:
 *   get:
 *     summary: Obtiene todas las marcas
 *     tags: [Marcas]
 *     responses:
 *       200:
 *         description: Lista de marcas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Marca'
 */

/**
 * @swagger
 * /api/v1/marcas/{id}:
 *   get:
 *     summary: Obtiene una marca por ID
 *     tags: [Marcas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la marca
 *     responses:
 *       200:
 *         description: Marca encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Marca'
 *       404:
 *         description: Marca no encontrada
 */

/**
 * @swagger
 * /api/v1/marcas:
 *   post:
 *     summary: Crea una nueva marca
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Marca'
 *     responses:
 *       201:
 *         description: Marca creada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 */

/**
 * @swagger
 * /api/v1/marcas/{id}:
 *   put:
 *     summary: Actualiza una marca
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la marca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Marca'
 *     responses:
 *       200:
 *         description: Marca actualizada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Marca no encontrada
 */

/**
 * @swagger
 * /api/v1/marcas/{id}:
 *   delete:
 *     summary: Elimina una marca
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la marca
 *     responses:
 *       200:
 *         description: Marca eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Marca no encontrada
 */