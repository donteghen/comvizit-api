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
    address: {
        town: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        }
    }
});
const Owner = (0, mongoose_1.model)('Owners', ownerSchema);
exports.Owner = Owner;
//# sourceMappingURL=owner.js.map