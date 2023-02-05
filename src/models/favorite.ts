import {Schema, model} from 'mongoose'

import { IFavorite } from './interfaces'


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
        user: Schema.Types.ObjectId,
        required: true
    }
}, {
    virtuals: true,
    timestamps: true
})

const Favorite = model<IFavorite>('Favorites', favoriteSchema)

export {Favorite}