import {Schema, model} from 'mongoose'

import { IComplain } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";

import { constants } from '../constants';
/**
 * Complain schema, represents the document property definition for a complain
 * @constructor Complain
 * @property {Schema.Types.ObjectId} targetId - The Id of the corresponding Property
 * @property {string} type - The type of complain, could be 'LANDLORD' or 'PROPERTY'
 * @property {string} subject - The subject of the complain
 * @property {string} message - The detailed complain message
 * @property {boolean} processed - The processed status of the complain
 * @property {number} updated - A timestamp in millseconds of the last time this doc was updated
 * @property {Schema.Types.ObjectId} plaintiveId - The Id of the user issuing the complain
 * @property {number} unique_id - Unique id
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
        enum: [constants.COMPLAIN_TYPES.property, constants.COMPLAIN_TYPES.landlord]
    },
    subject: {
        type: String,
        required: true,
        enum: [constants.COMPLAIN_SUBJECTS.reportLandlord, constants.COMPLAIN_SUBJECTS.reportProperty]
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
            const identity = await IdentityCounter.findOne({model: 'complain'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'complain',
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
const Complain = model<IComplain>('Complains', complainSchema)

export {Complain}