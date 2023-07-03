import {Schema, model} from 'mongoose'

import { ITag } from './interfaces'
import { NextFunction } from 'express';

/**
 * Tag schema, defines the Tag document properties
 * @constructor Tag
 * @param {string} type - The type of the tag, could be any of the following: 'Property', 'User'
 * @param {string} title - The tag's title
 * @param {string} code - The tag's code
 * @param {string} status - The tag's status; 'active' or 'inactive'
 * @param {string} refId - The Id of the corresponding tagged document
 * @param {string} createdDate - The time when the tag was created in milliseconds
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
            const collectionCount = await Tag.countDocuments();
            doc.unique_id = collectionCount + 1
        }
        next()

    } catch (error) {
        next(error)
    }
})
const Tag = model<ITag>('Tags', tagSchema)

export {Tag}


