const winston = require('winston');
const gidStorage = require('../middlewares/loggingMiddleware.js');
require('dotenv').config();
const { combine, timestamp, printf, errors, splat, colorize } = winston.format;
const path = require('path');

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

// Function to get the filename from the stack trace with error handling
const getFileNameFromStack = () => {
    try {
        const stack = new Error().stack.split('\n');
        for (let i = 3; i < stack.length; i++) {
            const match = stack[i].match(/\s+at\s+.+\s+\((.+):[\d]+:[\d]+\)/);
            if (match && match[1]) {
                return path.basename(match[1]);
            }
        }
    } catch (error) {
        console.error('Error getting filename from stack:', error);
    }
    return 'unknown';
};

// Safe getUserId function
const getUserId = () => {
    try {
        return gidStorage.getGid() || 'unknown';
    } catch (error) {
        return 'unknown';
    }
};

// Custom format for console logging
const customFormat = printf(({ level, message, timestamp, filename, userId, ...meta }) => {
    try {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [File: ${filename || 'unknown'}] [UserId: ${userId || 'unknown'}]: ${message}${metaStr}`;
    } catch (error) {
        return `[${timestamp}] [${level.toUpperCase()}] Error formatting log message`;
    }
});

// Configure the logger for console only
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: customLevels.levels,
    exitOnError: false,
    format: combine(
        timestamp(),
        errors({ stack: true }),
        splat()
    ),
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                customFormat
            ),
            handleExceptions: true,
            handleRejections: true
        })
    ]
});

// Safer process handling
process.on('unhandledRejection', (error) => {
    try {
        logger.error('Unhandled Rejection:', error);
        setTimeout(() => process.exit(1), 1000);
    } catch (err) {
        console.error('Error handling unhandled rejection:', err);
        process.exit(1);
    }
});

// Wrapper functions for log levels with error handling
const wrapLogFunction = (originalFunction) => {
    return function (message, meta = {}) {
        try {
            const filename = getFileNameFromStack();
            const userId = getUserId();
            return originalFunction.call(this, message, { 
                filename, 
                userId, 
                ...meta 
            });
        } catch (error) {
            console.error('Error in log wrapper:', error);
            return originalFunction.call(this, message);
        }
    };
};

// Wrap log functions with error handling
logger.error = wrapLogFunction(logger.error);
logger.warn = wrapLogFunction(logger.warn);
logger.info = wrapLogFunction(logger.info);
logger.debug = wrapLogFunction(logger.debug);

module.exports = logger;

