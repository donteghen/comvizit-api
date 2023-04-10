import {Schema, model} from 'mongoose'
import { IRentIntention } from './interfaces'


/**
 * RentIntention schema, represents the document property definition for a RentIntention
 * @constructor RentIntention
 * @param {object} propertyId - The id of the concerned property
 * @param {object} landlord - The id of the landlord who owns the concerned property
 * @param {object} potentialTenant - The Id of the potential tenant
 * @param {string} comment - A comment from the potential tenant
 * @param {string} status - The current status of the rent-intention(booking)
 * @param {string} initiatedAt - The timestamp in milliseconds representing the date when the rent-intention was initiated
 */

const rentIntentionSchema = new Schema<IRentIntention>({
    propertyId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    landlordId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    potentialTenantId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    comment: {
        type: String
    },
    status: {
        type: String,
        required: true,
        default: 'INITIATED',
        enum: ['INITIATED','CONFIRMED', 'CONCLUDED', 'CANCELED']
    },
    initiatedAt: {
        type: Number,
        required: true,
        default: Date.now()
    }
}, {
    virtuals: true,
    timestamps: true
})

const RentIntention = model<IRentIntention>('RentIntentions', rentIntentionSchema)

export {RentIntention}