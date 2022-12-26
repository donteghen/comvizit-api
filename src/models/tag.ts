import {Schema, model} from 'mongoose'

import { ITag } from './interfaces'

/**
 * Tag schema, defines the Tag document properties
 * @constructor Tag
 * @param {string} type - The type of the tag, could be any of the following: 'Property', 'User', 'Owner', 'Admin', 'Featured', 'Contact', 'Inquiry', or 'Complain'
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
        enum: ['Property', 'User', 'FeaturedProperty', 'Contact', 'Inquiry', 'Complain']
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
    createdDate: {
        type: Number,
        required: true,
        default: Date.now()
    },
}, {
    virtuals: true,
    timestamps: true
})

const Tag = model<ITag>('Tags', tagSchema)

export {Tag}


