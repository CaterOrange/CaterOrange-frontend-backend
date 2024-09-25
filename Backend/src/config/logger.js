const winston = require('winston');
const gidStorage = require('../middlewares/loggingMiddleware.js');
require('dotenv').config();
const { combine, timestamp, json, printf, errors, splat, colorize } = winston.format;
const fs = require('fs');
const path = require('path');
const dailyRotateFile = require('winston-daily-rotate-file');

// Create logs directory if it doesn't exist
const logDir = path.resolve(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Define custom log levels
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'cyan'
    }
};

// Apply custom colors to the levels
winston.addColors(customLevels.colors);

// Function to get the filename from the stack trace
const getFileNameFromStack = () => {
    const stack = new Error().stack.split('\n');
    for (let i = 3; i < stack.length; i++) {
        const match = stack[i].match(/\s+at\s+.+\s+\((.+):[\d]+:[\d]+\)/);
        if (match && match[1]) {
            return path.basename(match[1]);
        }
    }
    return 'unknown';
};

// Custom format for both console and file logging
const customFormat = printf(({ level, message, timestamp, filename, userId }) => {
    return `[${timestamp}] [${level.toUpperCase()}] [File: ${filename || 'unknown'}] [UserId: ${userId || 'unknown'}]: ${message}`;
});

// Configure the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: customLevels.levels,
    format: combine(
        timestamp(),
        errors({ stack: true }),
        splat()
    ),
    transports: [
        new dailyRotateFile({
            filename: path.join(logDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '1m',
            maxFiles: '1d',
            format: combine(
                customFormat,
                json()
            )
        }),
        new dailyRotateFile({
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '1m',
            maxFiles: '1d',
            format: combine(
                customFormat,
                json()
            )
        }),
        new winston.transports.Console({
            format: combine(
                colorize(),
                customFormat
            ),
        }),
    ],
});

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log'), format: combine(timestamp(), json()) })
);

process.on('unhandledRejection', (ex) => {
    throw ex;
});

// Wrapper functions for log levels to include filename and UserId
const wrapLogFunction = (originalFunction) => {
    return function (message, meta = {}) {
        const filename = getFileNameFromStack();
        const userId = gidStorage.getGid(); // Get the GID for logging, but we'll use it as UserId
        return originalFunction.call(this, message, { filename, userId, ...meta });
    };
};
// Wrap log functions to include filename and UserId
logger.error = wrapLogFunction(logger.error);
logger.warn = wrapLogFunction(logger.warn);
logger.info = wrapLogFunction(logger.info);
logger.debug = wrapLogFunction(logger.debug);

module.exports = logger;