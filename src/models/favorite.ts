import {Schema, model} from 'mongoose'

import { IFavorite } from './interfaces'
import { NextFunction } from 'express';


/**
 * Favorite schema, represents the document property definition for Favorites
 * @constructor Favorite
 * @param {object} propertyId - The id of the related property
 * @param {object} userId - The id of the concerned user(tenant)
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
            const collectionCount = await Favorite.countDocuments();
            doc.unique_id = collectionCount + 1
        }
        next()

    } catch (error) {
        next(error)
    }
})
const Favorite = model<IFavorite>('Favorites', favoriteSchema)

export {Favorite}