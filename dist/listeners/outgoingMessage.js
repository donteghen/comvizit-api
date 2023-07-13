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
exports.onOutgoingMessage = void 0;
const mongoose_1 = require("mongoose");
const server_1 = require("../server");
const chatmessage_1 = require("../models/chatmessage");
const logger_1 = require("../logs/logger");
const user_1 = require("../models/user");
const chat_1 = require("../models/chat");
function onOutgoingMessage(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // save the message
            const newMessage = new chatmessage_1.ChatMessage({
                chatId: data.chatId,
                senderId: data.senderId,
                content: data.content,
            });
            const message = yield newMessage.save();
            // emit the save message to all members of this room.
            server_1.io.in(data.chatId).emit('incoming_message', message);
            // get the chat to retreive the sender and receiver ids
            const chat = yield chat_1.Chat.findById(data.chatId);
            // update both sender && receiver
            const now = Date.now();
            const ids = [new mongoose_1.Types.ObjectId(chat.tenant), new mongoose_1.Types.ObjectId(chat.landlord)];
            yield user_1.User.updateMany({ _id: { $in: ids } }, { lastMessageDate: new Date(now), updated: now });
        }
        catch (error) {
            logger_1.logger.error(`An error occur while creating a new message and emiting incoming_message event due to : ${error !== null && error !== void 0 ? error : "Unrecognized reasons"}`);
            return;
        }
    });
}
exports.onOutgoingMessage = onOutgoingMessage;
//# sourceMappingURL=outgoingMessage.js.map