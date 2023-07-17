import {Schema, model} from 'mongoose'

import { IReview } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";


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
const reviewSchema = new Schema<IReview>({
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
        type: Schema.Types.ObjectId,
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
})

reviewSchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const identity = await IdentityCounter.findOne({model: 'review'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'review',
                field: 'unique_id'
              }) ;
              doc.unique_id = identityDocument.count;
              next();
            }
        }

    } catch (error) {
        next(error)
    }
})
const Review = model<IReview>('Reviews', reviewSchema)

export {Review}