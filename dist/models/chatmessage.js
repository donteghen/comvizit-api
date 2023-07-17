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
exports.ChatMessage = void 0;
const mongoose_1 = require("mongoose");
const identity_counter_1 = require("./identity-counter");
/**
 * Chat-message schema, represents the document property definition for a chat-message
 * @constructor Chat
 * @property {string} chatId - the id of the chat containing the chat message
 * @property {string} senderId - the user who sent the message
 * @property {string} content - message it self
 * @property {number} unique_id - Unique Id
 */
const ChatMessageSchema = new mongoose_1.Schema({
    chatId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
}, {
    timestamps: true
});
ChatMessageSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a new document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'chat-message' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'chat-message',
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
const ChatMessage = (0, mongoose_1.model)('ChatMessage', ChatMessageSchema);
exports.ChatMessage = ChatMessage;
//# sourceMappingURL=chatmessage.js.map