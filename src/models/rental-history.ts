import {Schema, model} from 'mongoose'
import { IRentalHistory } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";
import { constants } from '../constants';


/**
 * RentalHistory schema, represents the document property definition for a RentalHistory
 * @constructor RentalHistory
 * @property {object} propertyId - The id of the concerned property
 * @property {object} landlord - The id of the landlord who owns the concerned property
 * @property {object} tenantId - The Id of the  tenant
 * @property {string} startDate - The date of start of the rental contract
 * @property {string} endDate - The date of termination in milliseconds
 * @property {string} status - The current status of the rental-history
 * @property {number} unique_id - Unique id
 */

const rentalHistorySchema = new Schema<IRentalHistory>({
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
    tenantId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    startDate: {
        type: Number,
        required:true
    },
    endDate: {
        type: Number
    },
    status: {
        type: String,
        required: true,
        default: constants.RENTAL_HISTORY_STATUS_OPTIONS.ONGOING,
        enum: [
            constants.RENTAL_HISTORY_STATUS_OPTIONS.ONGOING,
            constants.RENTAL_HISTORY_STATUS_OPTIONS.TERMINATED
        ]
    },
    rentIntentionId: {
        type: Schema.Types.ObjectId,
        required: true
    }

}, {
    virtuals: true,
    timestamps: true
})
rentalHistorySchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const identity = await IdentityCounter.findOne({model: 'rental-history'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'rental-history',
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
const RentalHistory = model<IRentalHistory>('RentalHistories', rentalHistorySchema)

export {RentalHistory}