import {Schema, model} from 'mongoose'
import { IRentIntension } from './interfaces'


/**
 * RentIntension schema, represents the document property definition for a RentIntension
 * @constructor RentIntension
 * @param {object} propertyId - The id of the concerned property
 * @param {object} landlord - The id of the landlord who owns the concerned property
 * @param {object} potentialTenant - The Id of the potential tenant
 * @param {string} comment - A comment from the potential tenant
 */

const rentIntensionSchema = new Schema<IRentIntension>({
    propertyId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    landlordId: {
        user: Schema.Types.ObjectId,
        required: true
    },
    potentialTenantId: {
        user: Schema.Types.ObjectId,
        required: true
    },
    comment: {
        user: String
    }
}, {
    virtuals: true,
    timestamps: true
})

const RentIntension = model<IRentIntension>('RentIntensions', rentIntensionSchema)

export {RentIntension}