"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorite = void 0;
const mongoose_1 = require("mongoose");
/**
 * Favorite schema, represents the document property definition for Favorites
 * @constructor Favorite
 * @param {object} propertyId - The id of the related property
 * @param {object} userId - The id of the concerned user(tenant)
 */
const favoriteSchema = new mongoose_1.Schema({
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    }
}, {
    virtuals: true,
    timestamps: true
});
const Favorite = (0, mongoose_1.model)('Favorites', favoriteSchema);
exports.Favorite = Favorite;
//# sourceMappingURL=favorite.js.map