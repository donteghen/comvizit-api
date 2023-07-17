"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const mongoose_1 = require("mongoose");
/**
 * Log schema, represents the document property definition for a Log
 * @constructor Log
 * @property {Date} timestamp - The timestamp from when the log was created
 * @property {string} level - The log's proirity level
 * @property {string} message - The log's message message
 * @property {object} meta - The logs meta details (for stack tracing)
 */
const logSchema = new mongoose_1.Schema({
    timestamp: {
        type: Date,
    },
    level: {
        type: String,
    },
    message: {
        type: String,
    },
    meta: {}
});
const Log = (0, mongoose_1.model)('Logs', logSchema);
exports.Log = Log;
//# sourceMappingURL=log.js.map