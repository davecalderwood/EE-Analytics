const express = require('express');

const UserController = require('../controllers/user');

const router = express.Router();

// CREATE a new user
router.post('/signup', UserController.createUser);

// LOGIN 
router.post('/login', UserController.userLogin)

module.exports = router;