import {Schema, model} from 'mongoose'

import { ITag } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";

/**
 * Tag schema, defines the Tag document properties
 * @constructor Tag
 * @property {string} type - The type of the tag, could be any of the following: 'Property', 'User'
 * @property {string} title - The tag's title
 * @property {string} code - The tag's code
 * @property {string} status - The tag's status; 'active' or 'inactive'
 * @property {string} refId - The Id of the corresponding tagged document
 * @property {string} createdDate - The time when the tag was created in milliseconds
 * @property {number} unique_id - Unique id
 */
const tagSchema = new Schema<ITag>({
    type: {
        type: String,
        required: true,
        enum: ['Property', 'User']
    },
    title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    refId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    updated: {
        type: Number,
        required: true,
        default: Date.now()
    },
    createdDate: {
        type: Number,
        required: true,
        default: Date.now()
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

tagSchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const identity = await IdentityCounter.findOne({model: 'tag'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'tag',
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
const Tag = model<ITag>('Tags', tagSchema)

export {Tag}


