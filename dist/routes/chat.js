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
exports.ChatRouter = void 0;
const express_1 = __importDefault(require("express"));
const chat_1 = require("../models/chat");
const auth_middleware_1 = require("../middleware/auth-middleware");
const constants_1 = require("../constants");
const logger_1 = require("../logs/logger");
const mongoose_1 = require("mongoose");
const date_query_setter_1 = require("../utils/date-query-setter");
const constants_2 = require("../constants");
const { CHAT_PARAM_INVALID, INVALID_REQUEST, NOT_FOUND } = constants_1.errors;
const ChatRouter = express_1.default.Router();
exports.ChatRouter = ChatRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'unique_id':
            return { unique_id: Number(value) };
        default:
            return {};
    }
}
// create a chat
ChatRouter.post('/api/chats', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.body.tenant || !req.body.landlord) {
            throw CHAT_PARAM_INVALID;
        }
        // check if chat already exists between the tenant and landlord
        const existingChat = yield chat_1.Chat.findOne({
            tenant: req.body.tenant,
            landlord: req.body.landlord
        });
        if (existingChat) {
            return res.send({ ok: true, data: existingChat });
        }
        const newChat = new chat_1.Chat({
            tenant: req.body.tenant,
            landlord: req.body.landlord
        });
        const result = yield newChat.save();
        res.send({ ok: true, data: result });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while creating a chat due to : ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// get all chat by a user
ChatRouter.get('/api/chats', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        let pipeline;
        if (req.user.role === constants_2.constants.USER_ROLE.TENANT) {
            pipeline = [
                {
                    $match: {
                        tenant: req.user.id
                    }
                },
                {
                    $addFields: {
                        landlordId: { $toObjectId: "$landlord" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'landlordId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                }
            ];
        }
        else {
            pipeline = [
                {
                    $match: {
                        landlord: req.user.id
                    }
                },
                {
                    $addFields: {
                        tenantId: { $toObjectId: "$tenant" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'tenantId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                }
            ];
        }
        let userChats = yield chat_1.Chat.aggregate(pipeline).sort({ 'user.lastMessageDate': -1 });
        res.send({ ok: true, data: userChats });
    }
    catch (error) {
        console.log(error);
        logger_1.logger.error(`An error occured while getting the chat list for the user with id: ${req.user.id} due to : ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
/**
 * gets an existing chat between a tenant and landlord
 */
ChatRouter.get('/api/existing-chat', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { tenant, landlord } = req.query;
    try {
        if (!tenant || !landlord) {
            throw INVALID_REQUEST;
        }
        const chat = yield chat_1.Chat.findOne({
            landlord,
            tenant
        });
        if (!chat) {
            throw NOT_FOUND;
        }
        res.send({ ok: true, data: chat });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while fetching a chat between tenant and landlord  due to : ${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get a single chat
ChatRouter.get('/api/chats/:id', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        if (!req.params.id) {
            throw INVALID_REQUEST;
        }
        // check if the user is an admin and if yes then query only by id, else make sure the user is a member of that chat
        const chat = req.user.role === constants_2.constants.USER_ROLE.ADMIN ?
            yield chat_1.Chat.findOne({ _id: new mongoose_1.Types.ObjectId(req.params.id) })
            :
                req.user.role === constants_2.constants.USER_ROLE.TENANT ?
                    yield chat_1.Chat.findOne({ _id: new mongoose_1.Types.ObjectId(req.params.id), tenant: req.user.id })
                    :
                        yield chat_1.Chat.findOne({ _id: new mongoose_1.Types.ObjectId(req.params.id), landlord: req.user.id });
        if (!chat) {
            throw NOT_FOUND;
        }
        res.send({ ok: true, data: chat });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while getting the chat detail for the chat with id: ${req.params.id} due to : ${(_d = error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
/************************* Admin Restricted Endpoints *************************/
// get all chats by admin
ChatRouter.get('/api/all-chats', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
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
        const pipeline = [
            {
                $match: filter
            },
            {
                $addFields: {
                    tenantId: { $toObjectId: "$tenant" },
                    landlordId: { $toObjectId: "$landlord" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'tenantId',
                    foreignField: '_id',
                    as: 'tenantInfo'
                }
            },
            {
                $unwind: {
                    path: '$tenantInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'landlordId',
                    foreignField: '_id',
                    as: 'landlordInfo'
                }
            },
            {
                $unwind: {
                    path: '$landlordInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ];
        if (queries.includes('landlordId') && req.query['landlordId']) {
            pipeline.push({
                $match: {
                    'landlordInfo.unique_id': Number(req.query['landlordId'])
                }
            });
        }
        ;
        if (queries.includes('tenantId') && req.query['tenantId']) {
            pipeline.push({
                $match: {
                    'tenantInfo.unique_id': Number(req.query['tenantId'])
                }
            });
        }
        ;
        const chats = yield chat_1.Chat.aggregate(pipeline);
        res.send({ ok: true, data: chats });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while getting a chat list due to : ${(_e = error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=chat.js.map