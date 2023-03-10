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
exports.TagRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth-middleware");
const tag_1 = require("../models/tag");
const error_1 = require("../constants/error");
const mongoose_1 = require("mongoose");
const logger_1 = require("../logs/logger");
const TagRouter = express_1.default.Router();
exports.TagRouter = TagRouter;
/**
 * Get tag search query filter
 * @Method Tag
 * @param {string} key
 * @returns {any} any
 */
function setFilter(key, value) {
    switch (key) {
        case 'type':
            return { 'type': value };
        case 'title':
            return { 'title': value };
        case 'status':
            return { 'status': value };
        case 'code':
            return { 'code': value };
        case 'refId':
            return { 'refId': new mongoose_1.Types.ObjectId(value) };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// create new tag
TagRouter.post('/api/tags/add', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { type, title, refId } = req.body;
        const code = title ? title.toString().toLowerCase().split(' ').join('_') : '';
        const existAlready = yield tag_1.Tag.findOne({ $and: [{ refId }, { code }] });
        if (existAlready) {
            if (existAlready.status === 'Active') {
                throw (0, error_1.TAG_ALREADY_EXISTS)(existAlready.code, existAlready.type, existAlready.refId.toString());
            }
            existAlready.status = 'Active';
            yield existAlready.save();
            res.send({ ok: true, data: existAlready });
            return;
        }
        const newTag = new tag_1.Tag({
            code,
            type,
            title,
            refId: new mongoose_1.Types.ObjectId(refId)
        });
        const tag = yield newTag.save();
        if (!tag) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: tag });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while tagging a document with type: ${req.body.type} with refId ${req.body.refId} by admin due to ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// get all tags (with or without query string)
TagRouter.get('/api/tags', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        let filter = {};
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const tags = yield tag_1.Tag.find(filter);
        res.send({ ok: true, data: tags });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying tag list due to ${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
// get a single tag by id
TagRouter.get('/api/tags/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    try {
        const tag = yield tag_1.Tag.findById(req.params.id);
        if (!tag) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: tag });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying the details of the tag with id: ${req.params.id} due to ${(_e = error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error.message, code: (_f = error.code) !== null && _f !== void 0 ? _f : 1000 });
    }
}));
// ***************************** admin enpoints ***********************************************
// update tag's status
TagRouter.patch('/api/tags/:id/update', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    try {
        if (req.body.status) {
            const tag = yield tag_1.Tag.findById(req.params.id);
            if (!tag) {
                throw error_1.NOT_FOUND;
            }
            tag.status = req.body.status;
            tag.updated = Date.now();
            const updatedTag = yield tag.save();
            if (!updatedTag) {
                throw error_1.SAVE_OPERATION_FAILED;
            }
            res.send({ ok: true, data: updatedTag });
        }
        else {
            throw error_1.INVALID_REQUEST;
        }
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while updating the status of the tag with id: ${req.params.id} due to ${(_g = error === null || error === void 0 ? void 0 : error.message) !== null && _g !== void 0 ? _g : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_h = error.code) !== null && _h !== void 0 ? _h : 1000 });
    }
}));
// delete a tag by id
TagRouter.delete('/api/tags/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
    try {
        const tag = yield tag_1.Tag.findByIdAndDelete(req.params.id);
        if (!tag) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while deleting the tag with id: ${req.params.id} due to ${(_j = error === null || error === void 0 ? void 0 : error.message) !== null && _j !== void 0 ? _j : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_k = error.code) !== null && _k !== void 0 ? _k : 1000 });
    }
}));
//# sourceMappingURL=tag.js.map