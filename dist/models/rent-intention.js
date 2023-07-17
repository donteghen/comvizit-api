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
exports.RentIntention = void 0;
const mongoose_1 = require("mongoose");
const identity_counter_1 = require("./identity-counter");
/**
 * RentIntention schema, represents the document property definition for a RentIntention
 * @constructor RentIntention
 * @property {object} propertyId - The id of the concerned property
 * @property {object} landlord - The id of the landlord who owns the concerned property
 * @property {object} potentialTenant - The Id of the potential tenant
 * @property {string} comment - A comment from the potential tenant
 * @property {string} status - The current status of the rent-intention(booking)
 * @property {string} initiatedAt - The timestamp in milliseconds representing the date when the rent-intention was initiated
 * @property {number} unique_id - Unique id
 */
const rentIntentionSchema = new mongoose_1.Schema({
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
        enum: ['INITIATED', 'CONFIRMED', 'CONCLUDED', 'CANCELED']
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
rentIntentionSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'rent-intention' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'rent-intention',
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
const RentIntention = (0, mongoose_1.model)('RentIntentions', rentIntentionSchema);
exports.RentIntention = RentIntention;
//# sourceMappingURL=rent-intention.js.map