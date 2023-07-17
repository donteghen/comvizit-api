import {Schema, model} from 'mongoose'

import { IToken } from './interfaces'



/**
 * Token schema, represents the document property definition for a token
 * @constructor Token
 * @param {Schema.Types.ObjectId} owner - token owner's id
 * @param {string} secret - Token's secret key
 * @param {string} createdAt - Token's cretion time in milliseconds
 */
const tokenSchema = new Schema<IToken>({
    owner: {
        type: Schema.Types.ObjectId,
        required: true
    },
    secret: {
        type: String,
        required: true
    },
    generatedAt: {
        type: Number,
        required: true,
        default: Date.now()
    }
}, {
    virtuals: true,
    timestamps: true
})

const Token = model<IToken>('Tokens', tokenSchema)

export {Token}