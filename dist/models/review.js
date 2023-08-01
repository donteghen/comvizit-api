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
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const identity_counter_1 = require("./identity-counter");
const declared_1 = require("../constants/declared");
/**
 * Review schema, represents the document property definition for a review
 * @constructor Review
 * @property {string} type - The type of the document under review ie Property, Landlord, Tenant or Platform <Property or Landlord or Tenant or Platform>
 * @property {string} refId - The string Id of the related document or Platform (ie corresponding to a platform review)
 * @property {Schema.Types.ObjectId} author - The Id of the user making the review
 * @property {string} authorType - The reviewing user's role (ie LANDLORD OR TENANT)
 * @property {string} rating - The numeric value of the rating
 * @property {string} comment - The comment accompanying the review
 * @property {string} status - The current status of the review <Active  or Inactive>
 * @property {number} unique_id - Unique id
 */
const reviewSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            declared_1.constants.REVIEW_TYPES.PROPERTY,
            declared_1.constants.REVIEW_TYPES.LANDLORD,
            declared_1.constants.REVIEW_TYPES.TENANT,
            declared_1.constants.REVIEW_TYPES.PLATFORM
        ]
    },
    refId: {
        type: String,
        required: true
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    authorType: {
        type: String,
        required: true,
        enum: [
            declared_1.constants.REVIEW_AUTHOR_TYPE.TENANT,
            declared_1.constants.REVIEW_AUTHOR_TYPE.LANDLORD
        ]
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: declared_1.constants.REVIEW_STATUS.ACTIVE,
        enum: [
            declared_1.constants.REVIEW_STATUS.ACTIVE,
            declared_1.constants.REVIEW_STATUS.INACTIVE
        ]
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
reviewSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'review' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'review',
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
const Review = (0, mongoose_1.model)('Reviews', reviewSchema);
exports.Review = Review;
//# sourceMappingURL=review.js.map