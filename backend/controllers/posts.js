const Post = require('../models/post');

exports.createPost = (req, res, next) => {
    const imageURL = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: imageURL + '/images/' + req.file.filename,
        creator: req.userData.userId
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
    }).catch(error => {
        res.status(500).json({
            message: 'Creating the post failed!'
        })
    });
}

exports.updatePost = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const imageURL = req.protocol + '://' + req.get('host');
        imagePath = imageURL + '/images/' + req.file.filename
    }

    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
        if (result.matchedCount > 0) {
            res.status(200).json({ message: 'Update Successful' });
        } else {
            res.status(401).json({ message: 'User not Authorized' });
        }
    }).catch(error => {
        res.status(500).json({
            message: 'Updating the post failed!'
        })
    });
}

exports.getPosts = (req, res, next) => {
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
        }).catch(error => {
            res.status(500).json({
                message: 'Fetching posts failed!'
            })
        });
}

exports.getOnePost = (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: 'Post not found!' });
        }
    }).catch(error => {
        res.status(500).json({ message: 'Fetching post failed!' });
        console.log(error);
    });
}

exports.deletePost = (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Delete Successful' });
        } else {
            res.status(401).json({ message: 'User not Authorized' });
        }
    }).catch(error => {
        res.status(500).json({
            message: 'Deleting the post failed!'
        })
    });
}