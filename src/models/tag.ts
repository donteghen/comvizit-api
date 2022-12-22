import {Schema, model} from 'mongoose'

import { ITag } from './interfaces'

const tagSchema = new Schema<ITag>({
    type: {  // the related model name
        type: String,
        required: true,
        enum: ['Property', 'User', 'Owner', 'Admin', 'Featured', 'Contact', 'Inquiry', 'Complain']
    },
    title: {
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