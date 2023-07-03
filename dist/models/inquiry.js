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
exports.Inquiry = void 0;
const mongoose_1 = require("mongoose");
/**
 * Inquiry schema, represents the document property definition for a inquiry
 * @constructor Inquiry
 * @param {string} fullname - The fullname of the person who made the inquiry
 * @param {string} email - The email of the person who made the inquiry
 * @param {string} phone - The telephone number of the person who made the inquiry
 * @param {string} subject - The subject of the inquiry
 * @param {string} message - The message of the inquiry
 * @param {boolean} replied - Replied status of the inquiry document (true / false)
 * @param {number} updated - A timestamp in millseconds of the last time this doc was updated
 */
const inquirySchema = new mongoose_1.Schema({
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
    subject: {
        type: String,
        required: true
    },
    message: {
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
    },
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
}, {
    virtuals: true,
    timestamps: true
});
inquirySchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const collectionCount = yield Inquiry.countDocuments();
                doc.unique_id = collectionCount + 1;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
const Inquiry = (0, mongoose_1.model)('Inquiries', inquirySchema);
exports.Inquiry = Inquiry;
//# sourceMappingURL=inquiry.js.map