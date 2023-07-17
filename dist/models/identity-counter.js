"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityCounter = void 0;
const mongoose_1 = require("mongoose");
/**
 * IdentityCounter schema, represents the document property definition for an IdentityCounter
 * @constructor IdentityCounter
 * @property {string} model - identity's name
 * @property {string} field - identity's target property
 * @property {string} count - identity's current count
 */
const IdentityCounterSchema = new mongoose_1.Schema({
    model: {
        type: String,
        required: true
    },
    field: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true,
        default: 1
    },
}, {
    timestamps: true,
});
const IdentityCounter = (0, mongoose_1.model)('IdentityCounter', IdentityCounterSchema);
exports.IdentityCounter = IdentityCounter;
//# sourceMappingURL=identity-counter.js.map