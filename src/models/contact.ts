import {Schema, model} from 'mongoose'

import { IContact } from './interfaces'

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
    replied: {
        type: Boolean,
        required: true,
        default: false
    }
})

const Contact = model<IContact>('Contacts', contactSchema)

export {Contact}