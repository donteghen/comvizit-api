"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Complain = void 0;
const mongoose_1 = require("mongoose");
/**
 * Complain schema, represents the document property definition for a complain
 * @constructor Complain
 * @param {Schema.Types.ObjectId} targetId - The Id of the corresponding Property
 * @param {string} type - The type of complain, could be 'LANDLORD' or 'PROPERTY'
 * @param {string} subject - The subject of the complain
 * @param {string} message - The detailed complain message
 * @param {boolean} processed - The processed status of the complain
 * @param {number} updated - A timestamp in millseconds of the last time this doc was updated
 * @param {Schema.Types.ObjectId} plaintiveId - The Id of the user issuing the complain
 */
const complainSchema = new mongoose_1.Schema({
    targetId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    plaintiveId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['PROPERTY', 'LANDLORD']
    },
    subject: {
        type: String,
        required: true,
        enum: ['Report a Landlord', 'Report a Property']
    },
    message: {
        type: String,
        required: true
    },
    processed: {
        type: Boolean,
        required: true,
        default: false
    },
    updated: {
        type: Number,
        required: true,
        default: Date.now()
    }
}, {
    virtuals: true,
    timestamps: true
});
const Complain = (0, mongoose_1.model)('Complains', complainSchema);
exports.Complain = Complain;
//# sourceMappingURL=complain.js.map