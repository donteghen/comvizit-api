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
    unique_id: {
        type: Number,
        required: true,
        unique: true
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
contactSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const collectionCount = yield Contact.countDocuments();
                doc.unique_id = collectionCount + 1;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
const Contact = (0, mongoose_1.model)('Contacts', contactSchema);
exports.Contact = Contact;
//# sourceMappingURL=contact.js.map