const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

// CREATE a new user
router.post('/signup', (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
            .then(result => {
                res.status(201).json({
                    message: 'User Created',
                    result: result
                })
            })
            .catch(error => {
                res.status(500).json({
                    error: error
                });
            });
    });
});

// LOGIN 
router.post('/login', (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: "Authentication Failed"
                });
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password)
        })
        .then(result => {
            if (!result) {
                return res.status(401).json({
                    message: "Authentication Failed"
                });
            }
            // Successful login -> create web token
            const token = jwt.sign({
                email: fetchedUser.email,
                userId: fetchedUser._id
            },
                'secret_this_should_be_longer',
                { expiresIn: '1h' });
            res.status(200).json({
                token: token,
                expiresIn: 3600
            })
        })
        .catch(error => {
            console.log(error);
            return res.status(401).json({
                message: "Authentication Failed"
            });
        })
})

module.exports = router;