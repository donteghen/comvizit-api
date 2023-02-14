"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalHistory = void 0;
const mongoose_1 = require("mongoose");
/**
 * RentalHistory schema, represents the document property definition for a RentalHistory
 * @constructor RentalHistory
 * @param {object} propertyId - The id of the concerned property
 * @param {object} landlord - The id of the landlord who owns the concerned property
 * @param {object} tenantId - The Id of the  tenant
 * @param {string} startDate - The date of start of the rental contract
 * @param {string} endDate - The date of termination in milliseconds
 * @param {string} status - The current status of the rental-history
 */
const rentalHistorySchema = new mongoose_1.Schema({
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    landlordId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    startDate: {
        type: Number,
        required: true
    },
    endDate: {
        type: Number
    },
    status: {
        type: String,
        required: true,
        default: 'INITIATED',
        enum: ['ONGOING', 'TERMINATED']
    },
}, {
    virtuals: true,
    timestamps: true
});
const RentalHistory = (0, mongoose_1.model)('RentalHistories', rentalHistorySchema);
exports.RentalHistory = RentalHistory;
//# sourceMappingURL=rental-history.js.map