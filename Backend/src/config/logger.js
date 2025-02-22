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

// Custom format for both console and file logging
const customFormat = printf(({ level, message, timestamp, filename, userId, ...meta }) => {
    try {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [File: ${filename || 'unknown'}] [UserId: ${userId || 'unknown'}]: ${message}${metaStr}`;
    } catch (error) {
        return `[${timestamp}] [${level.toUpperCase()}] Error formatting log message`;
    }
});

// Create transports with error handling
const createDailyRotateFileTransport = (options) => {
    const transport = new dailyRotateFile({
        ...options,
        handleExceptions: true,
        handleRejections: true,
        maxSize: '10m', // Increased from 1m
        maxFiles: '14d', // Increased from 1d
        format: combine(
            customFormat,
            json()
        )
    });

    transport.on('error', (error) => {
        console.error('Error in daily rotate file transport:', error);
    });

    return transport;
};

// Configure the logger with error handling
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: customLevels.levels,
    exitOnError: false, // Don't exit on handled exceptions
    format: combine(
        timestamp(),
        errors({ stack: true }),
        splat()
    ),
    transports: [
        createDailyRotateFileTransport({
            filename: path.join(logDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD'
        }),
        createDailyRotateFileTransport({
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error'
        }),
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

// Exception handling with safeguards
const exceptionHandler = new winston.transports.File({ 
    filename: path.join(logDir, 'exceptions.log'),
    format: combine(timestamp(), json()),
    handleExceptions: true,
    handleRejections: true,
    maxsize: 10485760, // 10MB
    maxFiles: 5
});

exceptionHandler.on('error', (error) => {
    console.error('Error in exception handler:', error);
});

logger.exceptions.handle(exceptionHandler);

// Safer process handling
process.on('unhandledRejection', (error) => {
    try {
        logger.error('Unhandled Rejection:', error);
        // Give logger time to write before exiting
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