const express = require('express');

const EquipmentController = require('../controllers/equipment');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const router = express.Router();

// POST route for creating a new equipment
router.post('', checkAuth, extractFile, EquipmentController.createEquipment);

// PUT route for updating an existing equipment
router.put('/:id', checkAuth, extractFile, EquipmentController.updateEquipment);

// GET route for fetching all characters
router.get('', EquipmentController.getEquipment);

// GET route for fetching a single equipment by ID
router.get('/:id', EquipmentController.getOneEquipment);

// DELETE route for deleting an existing equipment by ID
router.delete('/:id', checkAuth, EquipmentController.deleteEquipment);

module.exports = router;