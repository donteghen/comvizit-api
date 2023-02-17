import {Schema, model} from 'mongoose'
import { IRentalHistory } from './interfaces'


/**
 * RentalHistory schema, represents the document property definition for a RentalHistory
 * @constructor RentalHistory
 * @param {object} propertyId - The id of the concerned property
 * @param {object} landlord - The id of the landlord who owns the concerned property
 * @param {object} tenantId - The Id of the  tenant
 * @param {string} startDate - The date of start of the rental contract
 * @param {string} endDate - The date of termination in milliseconds
 * @param {string} status - The current status of the rental-history
 */

const rentalHistorySchema = new Schema<IRentalHistory>({
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
        default: 'ONGOING',
        enum: ['ONGOING', 'TERMINATED']
    },
    rentIntentionId: {
        type: Schema.Types.ObjectId,
        required: true
    }

}, {
    virtuals: true,
    timestamps: true
})

const RentalHistory = model<IRentalHistory>('RentalHistories', rentalHistorySchema)

export {RentalHistory}