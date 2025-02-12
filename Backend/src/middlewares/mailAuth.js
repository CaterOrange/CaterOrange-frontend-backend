require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'orders@x.caterorange.com',
        pass: '&Sf7wK7i&Sf7wK7i'
    }
});

module.exports = { transporter };


