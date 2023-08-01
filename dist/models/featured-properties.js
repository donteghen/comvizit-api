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
exports.FeaturedProperties = void 0;
const mongoose_1 = require("mongoose");
const identity_counter_1 = require("./identity-counter");
const declared_1 = require("../constants/declared");
/**
 * FeaturedProperty schema, represents the document property definition for Fetatured Properties
 * @constructor FeaturedProperty
 * @property {string} propertyId - The Id of the corresponding Property
 * @property {number} duration - How long the property will be featured in milliseconds
 * @property {string} status - The status of the featuring, 'active' or 'inactive'
 * @property {number} startedAt - The time when the property astarted featuring in milliseconds
 * @property {number} unique_id - Unique id
 */
const featuredPropertySchema = new mongoose_1.Schema({
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    duration: {
        type: Number,
        required: true
    },
    startedAt: {
        type: Number,
        required: true,
        default: Date.now()
    },
    status: {
        type: String,
        required: true,
        enum: [declared_1.constants.FEATURED_PROPERTY_STATUS.ACTIVE, declared_1.constants.FEATURED_PROPERTY_STATUS.INACTIVE],
        default: 'Active'
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
featuredPropertySchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'featured-property' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'featured-property',
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
const FeaturedProperties = (0, mongoose_1.model)('FeaturedProperties', featuredPropertySchema);
exports.FeaturedProperties = FeaturedProperties;
//# sourceMappingURL=featured-properties.js.map