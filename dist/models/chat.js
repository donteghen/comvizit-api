"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = require("mongoose");
/**
 * Chat schema, represents the document property definition for a chat
 * @constructor Chat
 * @param {Array<String>} members - The list of all members within a chat
 */
const ChatSchema = new mongoose_1.Schema({
    members: {
        type: [String],
    },
}, {
    timestamps: true,
});
const Chat = (0, mongoose_1.model)('Chat', ChatSchema);
exports.Chat = Chat;
//# sourceMappingURL=chat.js.map