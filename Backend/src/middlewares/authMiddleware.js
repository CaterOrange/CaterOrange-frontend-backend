const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
require('dotenv').config();

const auth = (req, res, next) => {
    const token = req.headers['token'];
    console.log('Received token:', token);

    if (!token) {
        console.error('Access token is missing or not provided');
        return res.status(401).send('Access token is missing or not provided');
    }
const SECRET_KEY=process.env.SECRET_KEY
    jwt.verify(token, SECRET_KEY, (err, user) => {
        console.log('user',user)
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).send('Unauthorized access');
        }
        req.user = user;
        next();
    });
};



module.exports = auth;
