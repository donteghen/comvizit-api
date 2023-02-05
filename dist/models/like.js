"use strict";
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
        user: mongoose_1.Schema.Types.ObjectId,
        required: true
    }
}, {
    virtuals: true,
    timestamps: true
});
const Like = (0, mongoose_1.model)('Likes', likeSchema);
exports.Like = Like;
//# sourceMappingURL=like.js.map