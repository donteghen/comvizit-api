import {Schema, model} from 'mongoose'

import { IFeaturedProperties } from './interfaces'
import { NextFunction } from 'express';

/**
 * FeaturedProperty schema, represents the document property definition for Fetatured Properties
 * @constructor FeaturedProperty
 * @param {string} propertyId - The Id of the corresponding Property
 * @param {number} duration - How long the property will be featured in milliseconds
 * @param {string} status - The status of the featuring, 'active' or 'inactive'
 * @param {number} startedAt - The time when the property astarted featuring in milliseconds
 */
const featuredPropertySchema = new Schema<IFeaturedProperties>({
    propertyId: {
        type: Schema.Types.ObjectId,
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
        enum: ['Active', 'Inactive'],
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
})

featuredPropertySchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const collectionCount = await FeaturedProperties.countDocuments();
            doc.unique_id = collectionCount + 1
        }
        next()

    } catch (error) {
        next(error)
    }
})
const FeaturedProperties = model<IFeaturedProperties>('FeaturedProperties', featuredPropertySchema)

export {FeaturedProperties}