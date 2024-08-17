require('dotenv').config();

const jwt = require('jsonwebtoken');

module.exports = {
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        // Store token from authheader string eg: "Bearer token...."
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.sendStatus(401).json({ message: 'No token provided, authorization denied' });

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(403).json({ message: 'Token expired, please refresh the token' });
                }
                return res.status(403).json({ message: 'Token is not valid' });
            }

            req.user = user;
            next();
        });
    }
}