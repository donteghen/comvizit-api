import {Schema, model} from 'mongoose'

import { IFeaturedProperties } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";
import { constants } from '../constants';

/**
 * FeaturedProperty schema, represents the document property definition for Fetatured Properties
 * @constructor FeaturedProperty
 * @property {string} propertyId - The Id of the corresponding Property
 * @property {number} duration - How long the property will be featured in milliseconds
 * @property {string} status - The status of the featuring, 'active' or 'inactive'
 * @property {number} startedAt - The time when the property astarted featuring in milliseconds
 * @property {number} unique_id - Unique id
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
        enum: [constants.FEATURED_PROPERTY_STATUS.ACTIVE, constants.FEATURED_PROPERTY_STATUS.INACTIVE],
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
            const identity = await IdentityCounter.findOne({model: 'featured-property'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'featured-property',
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
const FeaturedProperties = model<IFeaturedProperties>('FeaturedProperties', featuredPropertySchema)

export {FeaturedProperties}