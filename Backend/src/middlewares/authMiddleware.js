// const jwt = require('jsonwebtoken');
// const logger = require('../config/logger');

// const auth = (req, res, next) => {
//     // Get the token from the request headers (can be 'Authorization' or 'token' based on your setup)
//     const token = req.headers['token'];

//     // If token is missing, respond with an error
//     if (!token) {
//         res.status(401).send('Access token is missing or not provided');
//         logger.info('Access token is missing or not provided');
//         return;
//     }

//     // Verify the token using the secret key
//     jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
//         if (err) {
//             // Handle expired tokens specifically
//             if (err.name === 'TokenExpiredError') {
//                 res.status(401).send('Access token has expired');
//                 logger.info('Access token has expired');
//             } else {
//                 // Handle other unauthorized access errors
//                 res.status(403).send('Unauthorized access');
//                 logger.info('Unauthorized access');
//             }
//             return;
//         }

//         // If token is valid, attach the user info to the request and proceed
//         req.user = user;
//         next();
//     });
// };

// module.exports = auth;
