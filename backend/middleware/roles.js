const jwt = require('jsonwebtoken');

module.exports = (roles) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, process.env.JWT_KEY);
            req.userData = decodedToken;

            if (!roles.includes(decodedToken.role)) {
                return res.status(403).json({ message: 'Access Denied' });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Auth failed!' });
        }
    }
}
