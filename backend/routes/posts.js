const express = require('express');

const PostController = require('../controllers/posts');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const router = express.Router();

// POST route for creating a new post
router.post('', checkAuth, extractFile, PostController.createPost);

// PUT route for updating an existing post
router.put('/:id', checkAuth, extractFile, PostController.updatePost);

// GET route for fetching all posts
router.get('', PostController.getPosts);

// GET route for fetching a single post by ID
router.get('/:id', PostController.getOnePost);

// DELETE route for deleting an existing post by ID
router.delete('/:id', checkAuth, PostController.deletePost);

module.exports = router;