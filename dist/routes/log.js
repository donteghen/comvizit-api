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
exports.LogRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth-middleware");
const log_1 = require("../models/log");
const error_1 = require("../constants/error");
const mongoose_1 = require("mongoose");
const logger_1 = require("../logs/logger");
const LogRouter = express_1.default.Router();
exports.LogRouter = LogRouter;
/**
 * Get tag search query filter
 * @Method Tag
 * @param {string} key
 * @returns {any} any
 */
function setFilter(key, value) {
    switch (key) {
        case 'level':
            return { 'level': value };
        case '_id':
            return { '_id': new mongoose_1.Types.ObjectId(value) };
        default:
            return {};
    }
}
// get all logs (with or without query string)
LogRouter.get('/api/logs', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        const logs = yield log_1.Log.find(filter);
        res.send({ ok: true, data: logs });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying log list due to ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// get a single log by id
LogRouter.get('/api/logs/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const log = yield log_1.Log.findById(req.params.id);
        if (!log) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: log });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying the details of the log with id: ${req.params.id} due to ${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
// delete a single log record by id
LogRouter.delete('/api/logs/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    try {
        const log = yield log_1.Log.findByIdAndDelete(req.params.id);
        if (!log) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while deleting the log with id: ${req.params.id} due to ${(_e = error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_f = error.code) !== null && _f !== void 0 ? _f : 1000 });
    }
}));
//# sourceMappingURL=log.js.map