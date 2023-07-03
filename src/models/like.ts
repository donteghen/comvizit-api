import {Schema, model} from 'mongoose'
import { ILike } from './interfaces'
import { NextFunction } from 'express';


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

likeSchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const collectionCount = await Like.countDocuments();
            doc.unique_id = collectionCount + 1
        }
        next()

    } catch (error) {
        next(error)
    }
})
const Like = model<ILike>('Likes', likeSchema)

export {Like}