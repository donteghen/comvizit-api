import {Schema, model} from 'mongoose'
import { ILike } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";


/**
 * Like schema, represents the document property definition for a Like
 * @constructor Like
 * @property {object} propertyId - The id of the property being liked
 * @property {object} userId - The id of the concerned user(tenant) liking the property
 * @property {number} unique_id - Unique id
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
            const identity = await IdentityCounter.findOne({model: 'like'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'like',
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
const Like = model<ILike>('Likes', likeSchema)

export {Like}