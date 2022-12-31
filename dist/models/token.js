"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const mongoose_1 = require("mongoose");
/**
 * Token schema, represents the document property definition for a token
 * @constructor Token
 * @param {Schema.Types.ObjectId} owner - token owner's id
 * @param {string} secret - Token's secret key
 * @param {string} createdAt - Token's cretion time in milliseconds
 */
const tokenSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
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
});
const Token = (0, mongoose_1.model)('Tokens', tokenSchema);
exports.Token = Token;
//# sourceMappingURL=token.js.map