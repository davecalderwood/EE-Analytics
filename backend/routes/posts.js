const express = require('express');
const multer = require('multer');
const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

// Setting up multer file upload storage configuration
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid Mime Type');
        if (isValid) {
            error = null;
        }
        callback(error, 'backend/images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const extension = MIME_TYPE_MAP[file.mimetype];
        callback(null, name + '-' + Date.now() + '.' + extension);
    }
});

// POST route for creating a new post
router.post(
    '',
    checkAuth,
    multer({ storage: storage }).single('image'),
    (req, res, next) => {
        const imageURL = req.protocol + '://' + req.get('host');
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            imagePath: imageURL + '/images/' + req.file.filename
        });
        // Mongoose creates query for db to create a new entry to MongoDB
        post.save().then(createdPost => {
            res.status(201).json({
                message: 'Post added successfully',
                post: {
                    id: createdPost._id,
                    title: createdPost.title,
                    content: createdPost.content,
                    imagePath: createdPost.imagePath
                }
            });
        });
    });

// PUT route for updating an existing post
router.put(
    '/:id',
    checkAuth,
    multer({ storage: storage }).single('image'),
    (req, res, next) => {
        let imagePath = req.body.imagePath;
        if (req.file) {
            const imageURL = req.protocol + '://' + req.get('host');
            imagePath = imageURL + '/images/' + req.file.filename
        }

        const post = new Post({
            _id: req.body.id,
            title: req.body.title,
            content: req.body.content,
            imagePath: imagePath
        });
        Post.updateOne({ _id: req.params.id }, post).then(result => {
            console.log(result);
            res.status(200).json({ message: 'Update Successful' });
        });
    });

// GET route for fetching all posts
router.get('', (req, res, next) => {
    // + converts string to int
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;

    // Mongoose query the db
    if (pageSize && currentPage) {
        postQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }

    postQuery
        .then(documents => {
            fetchedPosts = documents;
            return Post.countDocuments();
        })
        .then(count => {
            res.status(200).json({
                message: 'Posts fetched successfully',
                posts: fetchedPosts,
                maxPosts: count
            })
        })
});

// GET route for fetching a single post by ID
router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    }).catch(error => {
        res.status(500).json({ message: 'Fetching post failed!' });
        console.log(error);
    });
});

router.delete(
    '/:id',
    checkAuth,
    (req, res, next) => {
        Post.deleteOne({ _id: req.params.id }).then(result => {
            res.status(200).json({ message: 'Post Deleted' });
        });
    });

module.exports = router;