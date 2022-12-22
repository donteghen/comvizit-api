import {Schema, model} from 'mongoose'

import { IFeaturedProperties } from './interfaces'

const featuredPropertySchema = new Schema<IFeaturedProperties>({
    propertyId: {
        type: Schema.Types.ObjectId,
        required: true
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