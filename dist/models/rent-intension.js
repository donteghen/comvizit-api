"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentIntension = void 0;
const mongoose_1 = require("mongoose");
/**
 * RentIntension schema, represents the document property definition for a RentIntension
 * @constructor RentIntension
 * @param {object} propertyId - The id of the concerned property
 * @param {object} landlord - The id of the landlord who owns the concerned property
 * @param {object} potentialTenant - The Id of the potential tenant
 * @param {string} comment - A comment from the potential tenant
 */
const rentIntensionSchema = new mongoose_1.Schema({
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    landlordId: {
        user: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    potentialTenantId: {
        user: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    comment: {
        user: String
    }
}, {
    virtuals: true,
    timestamps: true
});
const RentIntension = (0, mongoose_1.model)('RentIntensions', rentIntensionSchema);
exports.RentIntension = RentIntension;
//# sourceMappingURL=rent-intension.js.map