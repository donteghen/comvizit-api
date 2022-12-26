import {Schema, model} from 'mongoose'

import { IFeaturedProperties } from './interfaces'

/**
 * FeaturedProperty schema, represents the document property definition for Fetatured Properties
 * @constructor FeaturedProperty
 * @param {string} propertyId - The Id of the corresponding Property
 * @param {string} duration - How long the property will be featured in milliseconds
 * @param {string} status - The status of the featuring, 'active' or 'inactive'
 * @param {string} startedAt - The time when the property astarted featuring in milliseconds
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
    }
}, {
    virtuals: true,
    timestamps: true
})

const FeaturedProperties = model<IFeaturedProperties>('FeaturedProperties', featuredPropertySchema)

export {FeaturedProperties}