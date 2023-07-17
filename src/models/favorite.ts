import {Schema, model} from 'mongoose'

import { IFavorite } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";


/**
 * Favorite schema, represents the document property definition for Favorites
 * @constructor Favorite
 * @property {object} propertyId - The id of the related property
 * @property {object} userId - The id of the concerned user(tenant)
 * @property {number} unique_id - Unique id
 */

const favoriteSchema = new Schema<IFavorite>({
    propertyId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
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

favoriteSchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const identity = await IdentityCounter.findOne({model: 'favorite'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'favorite',
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
const Favorite = model<IFavorite>('Favorites', favoriteSchema)

export {Favorite}