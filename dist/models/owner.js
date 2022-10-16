"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Owner = void 0;
const mongoose_1 = require("mongoose");
const ownerSchema = new mongoose_1.Schema({
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
    avatar: {
        type: String,
    },
    avatarDeleteId: {
        type: String,
    },
    address: {
        town: {
            type: String,
            required: true
        },
        quater: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        }
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
const Owner = (0, mongoose_1.model)('Owners', ownerSchema);
exports.Owner = Owner;
//# sourceMappingURL=owner.js.map