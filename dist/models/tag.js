"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = void 0;
const mongoose_1 = require("mongoose");
/**
 * Tag schema, defines the Tag document properties
 * @constructor Tag
 * @param {string} type - The type of the tag, could be any of the following: 'Property', 'User', 'Owner', 'Admin', 'Featured', 'Contact', 'Inquiry', or 'Complain'
 * @param {string} title - The tag's title
 * @param {string} code - The tag's code
 * @param {string} status - The tag's status; 'active' or 'inactive'
 * @param {string} refId - The Id of the corresponding tagged document
 * @param {string} createdDate - The time when the tag was created in milliseconds
 */
const tagSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Property', 'User', 'FeaturedProperty', 'Contact', 'Inquiry', 'Complain']
    },
    title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    refId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    updated: {
        type: Number,
        required: true,
        default: Date.now()
    },
    createdDate: {
        type: Number,
        required: true,
        default: Date.now()
    },
}, {
    virtuals: true,
    timestamps: true
});
const Tag = (0, mongoose_1.model)('Tags', tagSchema);
exports.Tag = Tag;
//# sourceMappingURL=tag.js.map