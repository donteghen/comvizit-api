const winston = require('winston')

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({format: "YY-MM-DD HH:mm:ss"}),
        winston.format.printf(({timestamp, service, level, message}) =>  `[${timestamp}] ${service} ${level}: ${message}`)
    ),
    transports: [new winston.transports.Console]
});

module.exports = logger
