import {Schema, model} from 'mongoose'

import { IOwner } from './interfaces'

const ownerSchema = new Schema<IOwner>({
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
    address: {
        town: {
            type: String,
            required: true
        },
        quater: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        }
    },
    updated: {
        type: Number,
        required: true,
        default: Date.now()
    }
})

const Owner = model<IOwner>('Owners', ownerSchema)
export {Owner}