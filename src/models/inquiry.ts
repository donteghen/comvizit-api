import {Schema, model} from 'mongoose'

import { IInquiry } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";


/**
 * Inquiry schema, represents the document property definition for a inquiry
 * @constructor Inquiry
 * @property {string} fullname - The fullname of the person who made the inquiry
 * @property {string} email - The email of the person who made the inquiry
 * @property {string} phone - The telephone number of the person who made the inquiry
 * @property {string} subject - The subject of the inquiry
 * @property {string} message - The message of the inquiry
 * @property {boolean} replied - Replied status of the inquiry document (true / false)
 * @property {number} updated - A timestamp in millseconds of the last time this doc was updated
 * @property {number} unique_id - Unique id
 */
const inquirySchema = new Schema<IInquiry>({
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
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    replied: {
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

inquirySchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const identity = await IdentityCounter.findOne({model: 'inquiry'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'inquiry',
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
const Inquiry = model<IInquiry>('Inquiries', inquirySchema)

export {Inquiry}