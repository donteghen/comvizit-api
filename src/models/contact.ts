import {Schema, model} from 'mongoose'
import { IContact } from './interfaces'
import { NextFunction } from 'express'
import { IdentityCounter } from "./identity-counter";


/**
 * Contact-me schema, represents the document property definition for contact-me message
 * @constructor Contact
 * @property {string} fullname - The fullname of the person to be contacted by comvizit support
 * @property {string} email - The email of the person to be contacted by comvizit support
 * @property {string} phone - The telephone number of the person to be contacted by comvizit support
 * @property {boolean} replied - Replied status of the contact-me document (true / false)
 * @property {number} updated - A timestamp in millseconds of the last time this doc was updated
 * @property {number} unique_id - Unique id
 */

const contactSchema = new Schema<IContact>({
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
    unique_id: {
        type: Number,
        required: true,
        unique: true
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
    }
}, {
    virtuals: true,
    timestamps: true
})

contactSchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const identity = await IdentityCounter.findOne({model: 'contact'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'contact',
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
const Contact = model<IContact>('Contacts', contactSchema)

export {Contact}