import {Schema, model, Types} from 'mongoose'
import { ILog } from './interfaces'
import { IdentityCounter } from "./identity-counter";

/**
 * Log schema, represents the document property definition for a Log
 * @constructor Log
 * @property {Date} timestamp - The timestamp from when the log was created
 * @property {string} level - The log's proirity level
 * @property {string} message - The log's message message
 * @property {object} meta - The logs meta details (for stack tracing)
 */
const logSchema = new Schema<ILog>({
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
})

const Log = model<ILog>('Logs', logSchema)

export {Log}