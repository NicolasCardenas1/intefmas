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