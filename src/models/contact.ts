import {Schema, model} from 'mongoose'
import { IContact } from './interfaces'
import { NextFunction } from 'express'


/**
 * Contact-me schema, represents the document property definition for contact-me message
 * @constructor Contact
 * @param {string} fullname - The fullname of the person to be contacted by comvizit support
 * @param {string} email - The email of the person to be contacted by comvizit support
 * @param {string} phone - The telephone number of the person to be contacted by comvizit support
 * @param {boolean} replied - Replied status of the contact-me document (true / false)
 * @param {number} updated - A timestamp in millseconds of the last time this doc was updated
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
            const collectionCount = await Contact.countDocuments();
            doc.unique_id = collectionCount + 1
        }
        next()

    } catch (error) {
        next(error)
    }
})
const Contact = model<IContact>('Contacts', contactSchema)

export {Contact}