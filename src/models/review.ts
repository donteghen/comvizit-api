import {Schema, model} from 'mongoose'

import { IReview } from './interfaces'

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
    }
}, {
    virtuals: true,
    timestamps: true
})

const Review = model<IReview>('Reviews', reviewSchema)

export {Review}