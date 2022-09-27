import {Schema, Types, model, Model} from 'mongoose'
import { IProperty } from './interfaces'

const propertySchema = new Schema<IProperty>({
    ownerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Owner'
    },
    price: {
        type: Number,
        req: true
    },
    propertyType: {
        type: String,
        required: true,
        enum: ['Studio', 'Apartment', 'Private Room', 'Villa', 'House']
    },
    propertSize: {
        type: Number,
        required: true
    },
    facilities: {
        type: [String],
        required: true
    },
    furnishedState: {
        type: String,
        required: true,
        enum: ['Furnished', 'Unfurnished']
    },
    amenities: {
        type: [String],
        required: true
    },
    description: {
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
        type: String,
        required: true
    },
    media: {
        photos: {
            type: [String],
            required: true
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
    rules: {
        type: [String],
        required: true
    },
    preferedTenant: {
        age: {
            type: Number,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'All'],
            required: true,
            default: 'All'
        },
        type: {
            type: String,
            enum: ['Student', 'Family', 'Others'],
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
        enum: ['Available', 'Taken'],
        required: true,
        default: 'Available'
    },
    rentUtilities: {
        eletricity: {
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
    }
})


const Property = model<IProperty>('Properties', propertySchema)

export {Property}