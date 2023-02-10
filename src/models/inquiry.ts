import {Schema, model} from 'mongoose'

import { IInquiry } from './interfaces'


/**
 * Inquiry schema, represents the document property definition for a inquiry
 * @constructor Inquiry
 * @param {string} fullname - The fullname of the person who made the inquiry
 * @param {string} email - The email of the person who made the inquiry
 * @param {string} phone - The telephone number of the person who made the inquiry
 * @param {string} subject - The subject of the inquiry
 * @param {string} message - The message of the inquiry
 * @param {boolean} replied - Replied status of the inquiry document (true / false)
 * @param {number} updated - A timestamp in millseconds of the last time this doc was updated
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
    }
}, {
    virtuals: true,
    timestamps: true
})

const Inquiry = model<IInquiry>('Inquiries', inquirySchema)

export {Inquiry}