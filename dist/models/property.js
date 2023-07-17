"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const mongoose_1 = require("mongoose");
const identity_counter_1 = require("./identity-counter");
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
const propertySchema = new mongoose_1.Schema({
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
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
        enum: ['Inactive', 'Available', 'Booked', 'Taken'],
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
propertySchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'property' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'property',
                        field: 'unique_id'
                    });
                    doc.unique_id = identityDocument.count;
                    next();
                }
            }
        }
        catch (error) {
            next(error);
        }
    });
});
const Property = (0, mongoose_1.model)('Properties', propertySchema);
exports.Property = Property;
//# sourceMappingURL=property.js.map