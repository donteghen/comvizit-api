"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturedProperties = void 0;
const mongoose_1 = require("mongoose");
/**
 * FeaturedProperty schema, represents the document property definition for Fetatured Properties
 * @constructor FeaturedProperty
 * @param {string} propertyId - The Id of the corresponding Property
 * @param {string} duration - How long the property will be featured in milliseconds
 * @param {string} status - The status of the featuring, 'active' or 'inactive'
 * @param {string} startedAt - The time when the property astarted featuring in milliseconds
 */
const featuredPropertySchema = new mongoose_1.Schema({
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    duration: {
        type: Number,
        required: true
    },
    startedAt: {
        type: Number,
        required: true,
        default: Date.now()
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    virtuals: true,
    timestamps: true
});
const FeaturedProperties = (0, mongoose_1.model)('FeaturedProperties', featuredPropertySchema);
exports.FeaturedProperties = FeaturedProperties;
//# sourceMappingURL=featured-properties.js.map