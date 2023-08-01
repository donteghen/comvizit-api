import {Schema, model} from 'mongoose'
import { IRentIntention } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";
import { constants } from '../constants/declared';


/**
 * RentIntention schema, represents the document property definition for a RentIntention
 * @constructor RentIntention
 * @property {object} propertyId - The id of the concerned property
 * @property {object} landlord - The id of the landlord who owns the concerned property
 * @property {object} potentialTenant - The Id of the potential tenant
 * @property {string} comment - A comment from the potential tenant
 * @property {string} status - The current status of the rent-intention(booking)
 * @property {string} initiatedAt - The timestamp in milliseconds representing the date when the rent-intention was initiated
 * @property {number} unique_id - Unique id
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
        default: constants.RENT_INTENTION_STATUS_OPTIONS.INITIATED,
        enum: [
            constants.RENT_INTENTION_STATUS_OPTIONS.INITIATED,
            constants.RENT_INTENTION_STATUS_OPTIONS.CONFIRMED,
            constants.RENT_INTENTION_STATUS_OPTIONS.CONCLUDED,
            constants.RENT_INTENTION_STATUS_OPTIONS.CANCELED
        ]
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
            const identity = await IdentityCounter.findOne({model: 'rent-intention'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'rent-intention',
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
const RentIntention = model<IRentIntention>('RentIntentions', rentIntentionSchema)

export {RentIntention}