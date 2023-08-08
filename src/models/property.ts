import {Schema, model} from 'mongoose'
import { IProperty } from './interfaces'
import { NextFunction } from 'express';
import { IdentityCounter } from "./identity-counter";

import { constants } from '../constants';
/**
 * Property schema, represents the document property definition for a Property
 * @constructor Property
 * @property {Schema.Types.ObjectId} ownerId - Property owner's reference ID
 * @property {number} price - Property rental price
 * @property {string} propertyType - Property type ['Studio', 'Apartment', 'Private Room', 'Villa', 'House', 'Office']
 * @property {string} updated - A timestamp in millseconds of the last time this doc was updated
 * @property {string} bedroom - Number of bedroom in the property
 * @property {number} propertySize - The size of the property
 * @property {Array<string>} facilities - Property's facilities
 * @property {string} furnishedState - The property's furnished state ['Furnished', 'Unfurnished']
 * @property {Array<string>} amenities - Property's amenities
 * @property {Array<string>} features - Property's features
 * @property {string} description - Property detailed description
 * @property {number} coords.lat - Property's lattitude coordinate number
 * @property {number} coords.log - Property's longitude coordinate number
 * @property {string} town - The town in which the property is located
 * @property {string} quater - The quater in which the property is located
 * @property {string} street - The street in which the property is located
 * @property {string} district - The district in which the property is located
 * @property {Array<string>} photos - Property's photos assets
 * @property {Array<PropertyVirtual>} virtualTours - Property's virtualTour assets
 * @property {Array<PropertyVideo>} videos - Property's video assets
 * @property {number} initialRent - Initial rent to be paid before moving into the property
 * @property {number} commission - The commission to be paid before moving into the property
 * @property {number}  deposit - The deposit to be paid before moving into the property
 * @property {number} bookingSummary.fee - The fee to be paid by the potential tenant to the landlord to confirm the booking
 * @property {number} bookingSummary.cancelationFee - The amount ot be deducted from the booking fee paid, should the tenant be the cause of an unconclusive booking
 * @property {Array<string>}  bookingSummary.paymentMethods - The payment methods allowed by the landlord
 * @property {number}  bookingSummary.maxDuration - The max number of days after which the booking will be cancelled
 * @property {Array<string>} rules - Property's rules to be followed by all tenants during their stay
 * @property {string} preferedTenant.gender - Gender of tenant prefered for this property
 * @property {string} preferedTenant.type - Type of tenant prefered for this property
 * @property {number} distanceFromRoad - Property's distance from the road in KM
 * @property {string} costFromRoad - Property's cost from the road
 * @property {string} availability - Property's availability ['Available', 'Taken', 'Inactive']
 * @property {boolean} rentUtilities.electricity - Determines if electricity bills are included in the rents
 * @property {boolean} rentUtilities.water - Determines if water bills are included in the rents
 * @property {boolean} rentUtilities.internet - Determines if internet bills are included in the rents
 * @property {boolean} rentUtilities.maintenance - - Determines if maintenance bills are included in the rents
 * @property {boolean} rentIntensions - List of rentIntension created for this property
 * @property {boolean} likes - Like id collection related to this property
 * @property {boolean} featuring - Determines if the property is being Featured or not(Listed)
 * @property {number} unique_id - Unique id
 */

const propertySchema = new Schema<IProperty>({
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    age: {
        type: Number,
        req: true
    },
    price: {
        type: Number,
        req: true
    },
    propertyType: {
        type: String,
        required: true,
        enum: [
            constants.PROPERTY_TYPES.STUDIO,
            constants.PROPERTY_TYPES.APARTMENT,
            constants.PROPERTY_TYPES.PRIVATE_ROOM,
            constants.PROPERTY_TYPES.VILLA,
            constants.PROPERTY_TYPES.HOUSE,
            constants.PROPERTY_TYPES.OFFICE
        ]
    },
    bedroom: {
        type: String,
        enum: [
            constants.PROPERTY_BEDROOM_OPTIONS.ONE,
            constants.PROPERTY_BEDROOM_OPTIONS.TWO,
            constants.PROPERTY_BEDROOM_OPTIONS.THREE,
            constants.PROPERTY_BEDROOM_OPTIONS.FOURPLUS
        ]
    },
    propertySize: {
        type: Number,
        required: true
    },
    facilities: {
        type: [String],
        required: true
    },
    features: {
        type: [String],
    },
    furnishedState: {
        type: String,
        required: true,
        enum: [
            constants.PROPERTY_FURNISHED_STATE.FURNISHED,
            constants.PROPERTY_FURNISHED_STATE.UNFURNISHED
        ]
    },
    amenities: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    descriptionFr: {
        type: String,
        required: true
    },
    coords:{
        lat: {
            type: Number,
            required: true
        },
        log: {
            type: Number,
            required: true
        }
    },
    town: {
        type: String,
        required: true
    },
    quater: {
        name: {
            type: String,
            required: true
        },
        ref: {
            type: String,
            required: true
        }
    },
    street: {
        type: String,
        required: true
    },
    district: {
        name: {
            type: String,
            required: true
        },
        ref: {
            type: String,
            required: true
        }
    },
    media: {
        photos: {
            type: [String],
        },
        virtualTours: [{
            title: {
                type: String
            },
            src: {
                type: String
            }
        }],
        videos: [{
            title: {
                type: String
            },
            src: {
                type: String
            }
        }]
    },
    rentSummary: {
        initialRent: {
            type: Number,
            required: true
        },
        commission: {
            type: Number,
            required: true
        },
        deposit: {
            type: Number,
            required: true
        }
    },
    bookingsummary: {
        fee: {
            type: Number,
            required: true
        },
        cancelationFee: {
            type: Number,
            required: true
        },
        paymentMethods: {
            type: [String],
            required: true
        },
        maxDuration: {
            type: Number,
            required: true
        }
    },
    rules: {
        type: [String],
        required: true
    },
    preferedTenant: {
        gender: {
            type: String,
            enum: [
                constants.PROPERTY_PREFERED_TENANT_GENDERS.MALE,
                constants.PROPERTY_PREFERED_TENANT_GENDERS.FEMALE,
                constants.PROPERTY_PREFERED_TENANT_GENDERS.ALL
            ],
            required: true,
            default: constants.PROPERTY_PREFERED_TENANT_GENDERS.ALL
        },
        type: {
            type: String,
            enum: [
                constants.PROPERTY_PREFERED_TENANT_TYPES.STUDENTS,
                constants.PROPERTY_PREFERED_TENANT_TYPES.FAMILY,
                constants.PROPERTY_PREFERED_TENANT_TYPES.ALL
            ],
            required: true
        }
    },
    distanceFromRoad:{
        type: Number,
        required: true
    },
    costFromRoad: {
        type: Number,
        required: true
    },
    availability: {
        type: String,
        enum: [
            constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.UNAVAILABLE,
            constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE,
            constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.BOOKED,
            constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.TAKEN
        ],
        required: true,
        default: constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.UNAVAILABLE,
    },
    rentUtilities: {
        electricity: {
            type: Boolean,
            default: false,
            required: true
        },
        water: {
            type: Boolean,
            default: false,
            required: true
        },
        internet: {
            type: Boolean,
            default: false,
            required: true
        },
        maintenance: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    updated: {
        type: Number,
        required: true,
        default: Date.now()
    },
    likes: {
        type: [String]
    },
    rentIntensions: {
        type: [String]
    },
    featuring: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    virtuals: true,
    timestamps: true
})

propertySchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const identity = await IdentityCounter.findOne({model: 'property'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'property',
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
const Property = model<IProperty>('Properties', propertySchema)

export {Property}