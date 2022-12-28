import {Schema, model} from 'mongoose'

import { IComplain } from './interfaces'

/**
 * Complain schema, represents the document property definition for Fetatured Properties
 * @constructor Complain
 * @param {Schema.Types.ObjectId} targetId - The Id of the corresponding Property
 * @param {string} type - The type of complain, could be 'LANDLORD' or 'PROPERTY'
 * @param {string} subject - The subject of the complain
 * @param {string} message - The detailed complain message
 * @param {boolean} processed - The processed status of the complain
 * @param {number} updated - A timestamp in millseconds of the last time this doc was updated
 * @param {Schema.Types.ObjectId} plaintiveId - The Id of the user issuing the complain
 */
const complainSchema = new Schema<IComplain>({
    targetId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['PROPERTY', 'LANDLORD']
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