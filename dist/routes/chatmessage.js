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
const date_query_setter_1 = require("../utils/date-query-setter");
const ChatMessageRouter = express_1.default.Router();
exports.ChatMessageRouter = ChatMessageRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
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
/**************************************** Admin Restricted Endpoints */
// get all messages in the admin
ChatMessageRouter.get('/api/all-chat-messages', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        let filter = {};
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                var _a, _b, _c, _d;
                let dateFilter = (0, date_query_setter_1.setDateFilter)((_b = (_a = req.query['startDate']) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '', (_d = (_c = req.query['endDate']) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '');
                filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) : filter;
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const chatMessages = yield chatmessage_1.ChatMessage.find(filter).sort({ createdAt: -1 });
        res.send({ ok: true, data: chatMessages });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while getting the chatmessages in the admin due to : ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=chatmessage.js.map