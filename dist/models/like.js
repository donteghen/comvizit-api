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
exports.Like = void 0;
const mongoose_1 = require("mongoose");
const identity_counter_1 = require("./identity-counter");
/**
 * Like schema, represents the document property definition for a Like
 * @constructor Like
 * @property {object} propertyId - The id of the property being liked
 * @property {object} userId - The id of the concerned user(tenant) liking the property
 * @property {number} unique_id - Unique id
 */
const likeSchema = new mongoose_1.Schema({
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    likerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
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
likeSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'like' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'like',
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
const Like = (0, mongoose_1.model)('Likes', likeSchema);
exports.Like = Like;
//# sourceMappingURL=like.js.map