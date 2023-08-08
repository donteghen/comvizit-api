"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalHistory = void 0;
const mongoose_1 = require("mongoose");
const identity_counter_1 = require("./identity-counter");
const constants_1 = require("../constants");
/**
 * RentalHistory schema, represents the document property definition for a RentalHistory
 * @constructor RentalHistory
 * @property {object} propertyId - The id of the concerned property
 * @property {object} landlord - The id of the landlord who owns the concerned property
 * @property {object} tenantId - The Id of the  tenant
 * @property {string} startDate - The date of start of the rental contract
 * @property {string} endDate - The date of termination in milliseconds
 * @property {string} status - The current status of the rental-history
 * @property {number} unique_id - Unique id
 */
const rentalHistorySchema = new mongoose_1.Schema({
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
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
        default: constants_1.constants.RENTAL_HISTORY_STATUS_OPTIONS.ONGOING,
        enum: [
            constants_1.constants.RENTAL_HISTORY_STATUS_OPTIONS.ONGOING,
            constants_1.constants.RENTAL_HISTORY_STATUS_OPTIONS.TERMINATED
        ]
    },
    rentIntentionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    }
}, {
    virtuals: true,
    timestamps: true
});
rentalHistorySchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'rental-history' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'rental-history',
                        field: 'unique_id'
                    });
                    doc.unique_id = identityDocument.count;
                    next();
                }
            }
        }
        catch (error) {
            next(error);
        }
    });
});
const RentalHistory = (0, mongoose_1.model)('RentalHistories', rentalHistorySchema);
exports.RentalHistory = RentalHistory;
//# sourceMappingURL=rental-history.js.map