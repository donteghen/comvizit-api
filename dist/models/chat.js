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
exports.Chat = void 0;
const mongoose_1 = require("mongoose");
const identity_counter_1 = require("./identity-counter");
/**
 * Chat schema, represents the document property definition for a chat
 * @constructor Chat
 * @property {string} tenant - tenant user
 * @property {string} landlord - landlord user
 * @property {number} unique_id - Unique Id
 */
const ChatSchema = new mongoose_1.Schema({
    tenant: {
        type: String,
        required: true
    },
    landlord: {
        type: String,
        required: true
    },
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
}, {
    timestamps: true,
});
ChatSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a new document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'chat' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'chat',
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
const Chat = (0, mongoose_1.model)('Chat', ChatSchema);
exports.Chat = Chat;
//# sourceMappingURL=chat.js.map