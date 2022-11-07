"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Complain = void 0;
const mongoose_1 = require("mongoose");
const complainSchema = new mongoose_1.Schema({
    target: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
        enum: ['Report a Landlord', 'Report a Property']
    },
    message: {
        type: String,
        required: true
    },
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
    processed: {
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
const Complain = (0, mongoose_1.model)('Complains', complainSchema);
exports.Complain = Complain;
//# sourceMappingURL=complain.js.map