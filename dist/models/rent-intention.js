"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentIntention = void 0;
const mongoose_1 = require("mongoose");
/**
 * RentIntention schema, represents the document property definition for a RentIntention
 * @constructor RentIntention
 * @param {object} propertyId - The id of the concerned property
 * @param {object} landlord - The id of the landlord who owns the concerned property
 * @param {object} potentialTenant - The Id of the potential tenant
 * @param {string} comment - A comment from the potential tenant
 * @param {string} status - The current status of the rent-intention
 * @param {string} initiatedAt - The timestamp in milliseconds representing the date when the rent-intention was initiated
 */
const rentIntentionSchema = new mongoose_1.Schema({
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    landlordId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    potentialTenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    comment: {
        type: String
    },
    status: {
        type: String,
        required: true,
        default: 'INITIATED',
        enum: ['INITIATED', 'CONCLUDED', 'UNCONCLUDED']
    },
    initiatedAt: {
        type: Number,
        required: true,
        default: Date.now()
    }
}, {
    virtuals: true,
    timestamps: true
});
const RentIntention = (0, mongoose_1.model)('RentIntentions', rentIntentionSchema);
exports.RentIntention = RentIntention;
//# sourceMappingURL=rent-intention.js.map