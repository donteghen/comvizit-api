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
/**
 * Review schema, represents the document property definition for a review
 * @constructor Review
 * @param {string} type - The type of the document under review ie Property, Landlord, Tenant or Platform <Property or Landlord or Tenant or Platform>
 * @param {string} refId - The string Id of the related document or Platform (ie corresponding to a platform review)
 * @param {Schema.Types.ObjectId} author - The Id of the user making the review
 * @param {string} authorType - The reviewing user's role (ie LANDLORD OR TENANT)
 * @param {string} rating - The numeric value of the rating
 * @param {string} comment - The comment accompanying the review
 * @param {string} status - The current status of the review <Active  or Inactive>
 */
const reviewSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Property', 'Landlord', 'Tenant', 'Platform']
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
        enum: ['TENANT', 'LANDLORD']
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
        default: 'Active',
        enum: ['Active', 'Inactive']
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
                const collectionCount = yield Review.countDocuments();
                doc.unique_id = collectionCount + 1;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
const Review = (0, mongoose_1.model)('Reviews', reviewSchema);
exports.Review = Review;
//# sourceMappingURL=review.js.map