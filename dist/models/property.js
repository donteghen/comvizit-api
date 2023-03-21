"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const mongoose_1 = require("mongoose");
/**
 * Property schema, represents the document property definition for a Property
 * @constructor Property
 * @param {Schema.Types.ObjectId} ownerId - Property owner's reference ID
 * @param {number} price - Property rental price
 * @param {string} propertyType - Property type ['Studio', 'Apartment', 'Private Room', 'Villa', 'House', 'Office']
 * @param {string} updated - A timestamp in millseconds of the last time this doc was updated
 * @param {string} bedroom - Number of bedroom in the property
 * @param {number} propertySize - The size of the property
 * @param {Array<string>} facilities - Property's facilities
 * @param {string} furnishedState - The property's furnished state ['Furnished', 'Unfurnished']
 * @param {Array<string>} amenities - Property's amenities
 * @param {Array<string>} features - Property's features
 * @param {string} description - Property detailed description
 * @param {number} coords.lat - Property's lattitude coordinate number
 * @param {number} coords.log - Property's longitude coordinate number
 * @param {string} town - The town in which the property is located
 * @param {string} quater - The quater in which the property is located
 * @param {string} street - The street in which the property is located
 * @param {string} district - The district in which the property is located
 * @param {Array<string>} photos - Property's photos assets
 * @param {Array<PropertyVirtual>} virtualTours - Property's virtualTour assets
 * @param {Array<PropertyVideo>} videos - Property's video assets
 * @param {number} initialRent - Initial rent to be paid before moving into the property
 * @param {number} commission - The commission to be paid before moving into the property
 * @param {number}  deposit - The deposit to be paid before moving into the property
 * @param {Array<string>} rules - Property's rules to be followed by all tenants during their stay
 * @param {string} preferedTenant.gender - Gender of tenant prefered for this property
 * @param {string} preferedTenant.type - Type of tenant prefered for this property
 * @param {number} distanceFromRoad - Property's distance from the road in KM
 * @param {string} costFromRoad - Property's cost from the road
 * @param {string} availability - Property's availability ['Available', 'Taken', 'Inactive']
 * @param {boolean} rentUtilities.electricity - Determines if electricity bills are included in the rents
 * @param {boolean} rentUtilities.water - Determines if water bills are included in the rents
 * @param {boolean} rentUtilities.internet - Determines if internet bills are included in the rents
 * @param {boolean} rentUtilities.maintenance - - Determines if maintenance bills are included in the rents
 * @param {boolean} rentIntensions - List of rentIntension created for this property
 * @param {boolean} likes - Like id collection related to this property
 * @param {boolean} featuring - Determines if the property is being Featured or not(Listed)
 */
const propertySchema = new mongoose_1.Schema({
    ownerId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: ['Studio', 'Apartment', 'Private Room', 'Villa', 'House', 'Office']
    },
    bedroom: {
        type: String,
        enum: ['ONE', 'TWO', 'THREE', 'FOURPLUS']
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
    descriptionFr: {
        type: String,
        required: true
    },
    coords: {
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
    rules: {
        type: [String],
        required: true
    },
    preferedTenant: {
        gender: {
            type: String,
            enum: ['Male', 'Female', 'All'],
            required: true,
            default: 'All'
        },
        type: {
            type: String,
            enum: ['Student', 'Family', 'All'],
            required: true
        }
    },
    distanceFromRoad: {
        type: Number,
        required: true
    },
    costFromRoad: {
        type: Number,
        required: true
    },
    availability: {
        type: String,
        enum: ['Inactive', 'Available', 'Taken'],
        required: true,
        default: 'Inactive'
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
});
const Property = (0, mongoose_1.model)('Properties', propertySchema);
exports.Property = Property;
//# sourceMappingURL=property.js.map