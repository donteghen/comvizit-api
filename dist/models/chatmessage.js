"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessage = void 0;
const mongoose_1 = require("mongoose");
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
}, {
    timestamps: true
});
const ChatMessage = (0, mongoose_1.model)('ChatMessage', ChatMessageSchema);
exports.ChatMessage = ChatMessage;
//# sourceMappingURL=chatmessage.js.map