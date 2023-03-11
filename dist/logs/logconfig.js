"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const winston_1 = require("winston");
const node_1 = require("@logtail/node");
const winston_2 = require("@logtail/winston");
const { MongoDB } = require("winston-mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { json, timestamp, errors, combine, metadata } = winston_1.format;
/*
 levels : {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}
 */
const dbOptions = {
    level: 'silly',
    collection: 'logs',
    db: 'mongodb+srv://comvizit:comvizit2022@cluster0.536pzjz.mongodb.net/?retryWrites=true&w=majority',
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    handleExceptions: true,
    capped: true,
    includeIds: true,
    format: combine(errors({ stack: true }), timestamp({ format: "YY-MM-DD HH:mm:ss" }), json({}), metadata())
};
const mongoTransport = new MongoDB(Object.assign({}, dbOptions));
const logtail = new node_1.Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
const logConfig = (0, winston_1.createLogger)({
    level: 'silly',
    format: combine(errors({ stack: true }), timestamp({ format: "YY-MM-DD HH:mm:ss" }), json()),
    transports: [
        new winston_1.transports.Console(),
        new winston_2.LogtailTransport(logtail, {
            level: 'info'
        }),
        mongoTransport
    ]
});
module.exports = logConfig;
//# sourceMappingURL=logconfig.js.map