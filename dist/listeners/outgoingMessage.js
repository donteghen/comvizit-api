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
const server_1 = require("../server");
const chatmessage_1 = require("../models/chatmessage");
function onOutgoingMessage(data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(data);
        // save the message
        const newMessage = new chatmessage_1.ChatMessage({
            chatId: data.chatId,
            senderId: data.senderId,
            content: data.content,
        });
        const mes = yield newMessage.save();
        console.log('Firing a new message by: ', mes.senderId, 'to : ', mes.content);
        // emit the save message to all members of this room.
        server_1.io.in(data.chatId).emit('incoming_message', mes);
    });
}
exports.onOutgoingMessage = onOutgoingMessage;
//# sourceMappingURL=outgoingMessage.js.map