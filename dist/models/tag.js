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
exports.Tag = void 0;
const mongoose_1 = require("mongoose");
/**
 * Tag schema, defines the Tag document properties
 * @constructor Tag
 * @param {string} type - The type of the tag, could be any of the following: 'Property', 'User'
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
        enum: ['Property', 'User']
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
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
}, {
    virtuals: true,
    timestamps: true
});
tagSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const collectionCount = yield Tag.countDocuments();
                doc.unique_id = collectionCount + 1;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
const Tag = (0, mongoose_1.model)('Tags', tagSchema);
exports.Tag = Tag;
//# sourceMappingURL=tag.js.map