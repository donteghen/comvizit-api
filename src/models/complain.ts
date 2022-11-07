import {Schema, model} from 'mongoose'

import { IComplain } from './interfaces'

const complainSchema = new Schema<IComplain>({
    target: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
        enum: ['Report a Landlord', 'Report a Property']
    },
    message: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    processed: {
        type: Boolean,
        required: true,
        default: false
    },
    updated: {
        type: Number,
        required: true,
        default: Date.now()
    }
}, {
    virtuals: true,
    timestamps: true
})

const Complain = model<IComplain>('Complains', complainSchema)

export {Complain}