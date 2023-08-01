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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageRouter = void 0;
const express_1 = __importDefault(require("express"));
const chatmessage_1 = require("../models/chatmessage");
const auth_middleware_1 = require("../middleware/auth-middleware");
const error_1 = require("../constants/error");
const logger_1 = require("../logs/logger");
const ChatMessageRouter = express_1.default.Router();
exports.ChatMessageRouter = ChatMessageRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'unique_id':
            return { unique_id: Number(value) };
        case 'chatId':
            return { 'chatId': value };
        case 'senderId':
            return { 'senderId': value };
        default:
            return {};
    }
}
// add a message
ChatMessageRouter.post('/api/chat-messages', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { chatId, senderId, content } = req.body;
        if (!chatId || !senderId || !content) {
            throw error_1.CHAT_MESSAGE_PARAM_INVALID;
        }
        const newChatMessage = new chatmessage_1.ChatMessage({
            chatId,
            senderId,
            content,
        });
        const chatMessage = yield newChatMessage.save();
        res.send({ ok: true, data: chatMessage });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while adding a chatMesage due to : ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// get all chat messages
ChatMessageRouter.get('/api/chat-messages', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const pageSize = process.env.CHAT_MESSAGE_PAGE_SIZE ? Number(process.env.CHAT_MESSAGE_PAGE_SIZE) : 10;
    const chatId = req.query.chatId;
    const page = req.query.page ? Number(req.query.page) : 1;
    try {
        if (!chatId) {
            return res.send({ ok: true, data: [] });
        }
        let pipeline = [
            {
                $match: {
                    chatId
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: (Number(page) - 1) * pageSize
            },
            {
                $limit: pageSize
            }
        ];
        const chatMessages = yield chatmessage_1.ChatMessage.aggregate(pipeline);
        const totalChatMessageCount = yield chatmessage_1.ChatMessage.countDocuments({ chatId });
        const totalPages = Math.ceil(totalChatMessageCount / pageSize);
        const hasMore = page < totalPages ? true : false;
        res.send({ ok: true, data: { messages: chatMessages, hasMore, page, total: totalChatMessageCount, pageCount: totalPages } });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while getting the chatmessages for chat id: ${chatId} due to ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=chatmessage.js.map