const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
require('dotenv').config();

const auth = (req, res, next) => {
    // Extract token from 'token' header
    console.log('headers', req.headers)

    const token = req.headers['token'];
    console.log('Received token:', token); // You can log this for debugging

    // If no token is provided, return a 401 Unauthorized response
    if (!token) {
        console.error('Access token is missing or not provided');
        return res.status(401).send('Access token is missing or not provided');
    }

    // Ensure the SECRET_KEY is set
    const SECRET_KEY = process.env.SECRET_KEY;
    console.log("key", SECRET_KEY)
    if (!SECRET_KEY) {
        console.error('SECRET_KEY is missing in environment variables!');
        return res.status(500).send('Server configuration error');
    }

    // Verify the token using the SECRET_KEY
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.status(403).send('Unauthorized access');
        }

        // If verification is successful, attach the user data to the request
        req.user = user;
        next(); // Proceed to the next middleware or controller
    });
};

module.exports = auth;