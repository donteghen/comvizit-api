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
exports.Complain = void 0;
const mongoose_1 = require("mongoose");
const identity_counter_1 = require("./identity-counter");
const declared_1 = require("../constants/declared");
/**
 * Complain schema, represents the document property definition for a complain
 * @constructor Complain
 * @property {Schema.Types.ObjectId} targetId - The Id of the corresponding Property
 * @property {string} type - The type of complain, could be 'LANDLORD' or 'PROPERTY'
 * @property {string} subject - The subject of the complain
 * @property {string} message - The detailed complain message
 * @property {boolean} processed - The processed status of the complain
 * @property {number} updated - A timestamp in millseconds of the last time this doc was updated
 * @property {Schema.Types.ObjectId} plaintiveId - The Id of the user issuing the complain
 * @property {number} unique_id - Unique id
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
        enum: [declared_1.constants.COMPLAIN_TYPES.property, declared_1.constants.COMPLAIN_TYPES.landlord]
    },
    subject: {
        type: String,
        required: true,
        enum: [declared_1.constants.COMPLAIN_SUBJECTS.reportLandlord, declared_1.constants.COMPLAIN_SUBJECTS.reportProperty]
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
    },
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
}, {
    virtuals: true,
    timestamps: true
});
complainSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'complain' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'complain',
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
const Complain = (0, mongoose_1.model)('Complains', complainSchema);
exports.Complain = Complain;
//# sourceMappingURL=complain.js.map