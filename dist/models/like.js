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
/**
 * Like schema, represents the document property definition for a Like
 * @constructor Like
 * @param {object} propertyId - The id of the property being liked
 * @param {object} userId - The id of the concerned user(tenant) liking the property
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
                const collectionCount = yield Like.countDocuments();
                doc.unique_id = collectionCount + 1;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
const Like = (0, mongoose_1.model)('Likes', likeSchema);
exports.Like = Like;
//# sourceMappingURL=like.js.map