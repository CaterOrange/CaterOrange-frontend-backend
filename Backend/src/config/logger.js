const winston = require('winston');
require('dotenv').config();
const { combine, timestamp, json, printf } = winston.format;
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp }) => {
  return `[${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info',
      format: combine(timestamp(), json()),
    }),
    new winston.transports.Console({
      format: combine(consoleFormat, timestamp()), // Human-readable format for console logs
    }),
  ],
});



module.exports = logger;