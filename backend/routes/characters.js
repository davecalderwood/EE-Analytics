const express = require('express');

const CharacterController = require('../controllers/characters');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const router = express.Router();

// POST route for creating a new character
router.post('', checkAuth, extractFile, CharacterController.createCharacter);

// PUT route for updating an existing character
router.put('/:id', checkAuth, extractFile, CharacterController.updateCharacter);

// GET route for fetching all characters
router.get('', CharacterController.getCharacters);

// GET route for fetching a single character by ID
router.get('/:id', CharacterController.getOneCharacter);

// DELETE route for deleting an existing character by ID
router.delete('/:id', checkAuth, CharacterController.deleteCharacter);

module.exports = router;