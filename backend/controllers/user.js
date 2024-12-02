const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.createUser = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new User({
            email: req.body.email,
            password: hash,
            roles: req.body.roles || ['user']
        });
        user.save()
            .then(result => {
                res.status(201).json({
                    message: 'User Created',
                    result: result
                });
            })
            .catch(error => {
                console.error("Error details:", error);
                res.status(500).json({
                    message: 'Failed to create user.',
                    error: error.message
                });
            });
    });
};

exports.userLogin = (req, res, next) => {
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
                userId: fetchedUser._id,
                roles: fetchedUser.roles
            },
                process.env.JWT_KEY,
                { expiresIn: '1h' });
            res.status(200).json({
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id
            })
        })
        .catch(error => {
            console.log(error);
            return res.status(401).json({
                message: 'Invalid authentication credentials!'
            });
        })
}