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
        case 'message':
            return { 'message': { "$regex": value, $options: 'i' } };
        default:
            return {};
    }
}
/**
 * set the date filter condition
 * @function setLogDateFilter
 * @param {string} startDate - The date's lower range limit
 * @param {string} endDate - The date's upper range limit
 * @returns {string}
 */
function setLogDateFilter(startDate, endDate) {
    let condition = {};
    if (startDate && startDate.length > 0 && !endDate) {
        condition = {
            timestamp: {
                $gt: new Date(startDate).toISOString()
            }
        };
    }
    else if (!startDate && endDate && endDate.length > 0) {
        condition = {
            timestamp: {
                $lt: new Date(endDate).toISOString()
            }
        };
    }
    else if (startDate && startDate.length > 0 && endDate && endDate.length > 0) {
        condition = {
            $and: [
                {
                    timestamp: {
                        $gt: new Date(startDate).toISOString()
                    }
                },
                {
                    timestamp: {
                        $lt: new Date(endDate).toISOString()
                    }
                }
            ]
        };
    }
    else {
        condition = {};
    }
    return condition;
}
// get all logs (with or without query string)
LogRouter.get('/api/logs', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let filter = {};
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                var _a, _b, _c, _d;
                let dateFilter = setLogDateFilter((_b = (_a = req.query['startDate']) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '', (_d = (_c = req.query['endDate']) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '');
                filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) : filter;
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
        res.status(400).send({ ok: false, error });
    }
}));
// get a single log by id
LogRouter.get('/api/logs/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const log = yield log_1.Log.findById(req.params.id);
        if (!log) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: log });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying the details of the log with id: ${req.params.id} due to ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// delete a single log record by id
LogRouter.delete('/api/logs/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const log = yield log_1.Log.findByIdAndDelete(req.params.id);
        if (!log) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while deleting the log with id: ${req.params.id} due to ${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=log.js.map