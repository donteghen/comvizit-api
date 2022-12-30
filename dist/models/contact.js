"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const mongoose_1 = require("mongoose");
/**
 * Contact-me schema, represents the document property definition for contact-me message
 * @constructor Contact
 * @param {string} fullname - The fullname of the person to be contacted by comvizit support
 * @param {string} email - The email of the person to be contacted by comvizit support
 * @param {string} phone - The telephone number of the person to be contacted by comvizit support
 * @param {boolean} replied - Replied status of the contact-me document (true / false)
 * @param {number} updated - A timestamp in millseconds of the last time this doc was updated
 */
const contactSchema = new mongoose_1.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    replied: {
        type: Boolean,
        required: true,
        default: false
    },
    updated: {
        type: Number,
        required: true,
        default: Date.now()
    }
}, {
    virtuals: true,
    timestamps: true
});
const Contact = (0, mongoose_1.model)('Contacts', contactSchema);
exports.Contact = Contact;
//# sourceMappingURL=contact.js.map