import {Schema, model} from 'mongoose'
import { IRentIntention } from './interfaces'
import { NextFunction } from 'express';


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
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
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

rentIntentionSchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const collectionCount = await RentIntention.countDocuments();
            doc.unique_id = collectionCount + 1
        }
        next()

    } catch (error) {
        next(error)
    }
})
const RentIntention = model<IRentIntention>('RentIntentions', rentIntentionSchema)

export {RentIntention}