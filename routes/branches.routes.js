// routes/branches.routes.js
const express = require('express');
const router = express.Router();
const branchesController = require('../controllers/branches.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', branchesController.getAllBranches);
router.get('/:id', branchesController.getBranchById);

// Rutas protegidas (solo admin)
router.post('/', [verifyToken, isAdmin], branchesController.createBranch);
router.put('/:id', [verifyToken, isAdmin], branchesController.updateBranch);
router.delete('/:id', [verifyToken, isAdmin], branchesController.deleteBranch);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Sucursal:
 *       type: object
 *       required:
 *         - nombre
 *         - direccion
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la sucursal
 *         nombre:
 *           type: string
 *           description: Nombre de la sucursal
 *         direccion:
 *           type: string
 *           description: Dirección física de la sucursal
 *         telefono:
 *           type: string
 *           description: Número de teléfono de contacto
 *         horario:
 *           type: string
 *           description: Horario de atención
 *         activo:
 *           type: boolean
 *           description: Estado de la sucursal
 */

/**
 * @swagger
 * tags:
 *   name: Sucursales
 *   description: API para gestionar sucursales
 */

/**
 * @swagger
 * /api/v1/sucursales:
 *   get:
 *     summary: Obtiene todas las sucursales
 *     tags: [Sucursales]
 *     responses:
 *       200:
 *         description: Lista de sucursales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sucursal'
 */

/**
 * @swagger
 * /api/v1/sucursales/{id}:
 *   get:
 *     summary: Obtiene una sucursal por ID
 *     tags: [Sucursales]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sucursal encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sucursal'
 *       404:
 *         description: Sucursal no encontrada
 */

/**
 * @swagger
 * /api/v1/sucursales:
 *   post:
 *     summary: Crea una nueva sucursal
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sucursal'
 *     responses:
 *       201:
 *         description: Sucursal creada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 */

/**
 * @swagger
 * /api/v1/sucursales/{id}:
 *   put:
 *     summary: Actualiza una sucursal
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sucursal'
 *     responses:
 *       200:
 *         description: Sucursal actualizada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Sucursal no encontrada
 */

/**
 * @swagger
 * /api/v1/sucursales/{id}:
 *   delete:
 *     summary: Elimina una sucursal
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sucursal eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido
 *       404:
 *         description: Sucursal no encontrada
 */