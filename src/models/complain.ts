import {Schema, model} from 'mongoose'

import { IComplain } from './interfaces'
import { NextFunction } from 'express';

/**
 * Complain schema, represents the document property definition for a complain
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
    plaintiveId: {
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

complainSchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const collectionCount = await Complain.countDocuments();
            doc.unique_id = collectionCount + 1
        }
        next()

    } catch (error) {
        next(error)
    }
})
const Complain = model<IComplain>('Complains', complainSchema)

export {Complain}