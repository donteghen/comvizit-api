import {Schema, model} from 'mongoose'
import { ILike } from './interfaces'


/**
 * Like schema, represents the document property definition for a Like
 * @constructor Like
 * @param {object} propertyId - The id of the property being liked
 * @param {object} userId - The id of the concerned user(tenant) liking the property
 */

const likeSchema = new Schema<ILike>({
    propertyId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    likerId: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, {
    virtuals: true,
    timestamps: true
})

const Like = model<ILike>('Likes', likeSchema)

export {Like}