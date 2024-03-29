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
exports.ComplainRouter = void 0;
const express_1 = __importDefault(require("express"));
const constants_1 = require("../constants");
const auth_middleware_1 = require("../middleware/auth-middleware");
const complain_1 = require("../models/complain");
const mailer_1 = require("../helper/mailer");
const mailer_templates_1 = require("../utils/mailer-templates");
const mongoose_1 = require("mongoose");
const logger_1 = require("../logs/logger");
const date_query_setter_1 = require("../utils/date-query-setter");
const { NOT_FOUND, DELETE_OPERATION_FAILED } = constants_1.errors;
const ComplainRouter = express_1.default.Router();
exports.ComplainRouter = ComplainRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'unique_id':
            return { unique_id: Number(value) };
        case 'processed':
            let v;
            if (typeof value === 'string') {
                v = value === 'true' ? true : false;
            }
            else {
                v = value;
            }
            return { 'processed': v };
        case 'type':
            return { 'type': value };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// create new complain
ComplainRouter.post('/api/complains', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type, targetId, subject, message } = req.body;
        const newComplain = new complain_1.Complain({
            plaintiveId: new mongoose_1.Types.ObjectId(req.user.id),
            type,
            targetId,
            subject,
            message
        });
        const complain = yield newComplain.save();
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`;
        const _success = yield (0, mailer_1.mailer)(process.env.SENDGRID_VERIFIED_SENDER, mailer_templates_1.notifyNewComplained.subject, mailer_templates_1.notifyNewComplained.heading, mailer_templates_1.notifyNewComplained.detail, _link, mailer_templates_1.notifyNewComplained.linkText);
        res.send({ ok: true, data: complain });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while creating a complain due to : ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// get all complains (with or without query string)
ComplainRouter.get('/api/complains', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f;
    try {
        let filter = req.user.role === constants_1.constants.USER_ROLE.TENANT ?
            { potentialTenantId: new mongoose_1.Types.ObjectId(req.user.id) }
            :
                req.user.role === constants_1.constants.USER_ROLE.LANDLORD ?
                    { landlordId: new mongoose_1.Types.ObjectId(req.user.id) }
                    :
                        {};
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            let dateFilter = (0, date_query_setter_1.setDateFilter)((_c = (_b = req.query['startDate']) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '', (_e = (_d = req.query['endDate']) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : '');
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) : filter;
            queries.forEach(key => {
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
                $lookup: {
                    from: "users",
                    localField: "plaintiveId",
                    foreignField: "_id",
                    as: "plaintive"
                }
            },
            {
                $unwind: {
                    path: "$plaintive",
                    preserveNullAndEmptyArrays: true
                }
            }
        ];
        if (req.user.role === constants_1.constants.USER_ROLE.ADMIN && queries.includes('plaintiveId') && req.query['plaintiveId']) {
            pipeline.push({
                $match: {
                    'plaintive.unique_id': Number(req.query['plaintiveId'])
                }
            });
        }
        ;
        const complains = yield complain_1.Complain.aggregate(pipeline);
        res.send({ ok: true, data: complains });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while querying complain list due to : ${(_f = error === null || error === void 0 ? void 0 : error.message) !== null && _f !== void 0 ? _f : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get single complain by id
ComplainRouter.get('/api/complains/:id', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const complain = yield complain_1.Complain.findById(req.params.id);
        if (!complain) {
            throw NOT_FOUND;
        }
        res.send({ ok: true, data: complain });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while querying complain detail by id: ${req.params.id} due to : ${(_g = error === null || error === void 0 ? void 0 : error.message) !== null && _g !== void 0 ? _g : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// make complain as processed
ComplainRouter.patch('/api/complains/:id/process', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        const complain = yield complain_1.Complain.findById(req.params.id);
        if (!complain) {
            throw NOT_FOUND;
        }
        complain.processed = true;
        complain.updated = Date.now();
        const updateComplain = yield complain.save();
        res.send({ ok: true, data: updateComplain });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while updating the complain with id: ${req.params.id} due to : ${(_h = error === null || error === void 0 ? void 0 : error.message) !== null && _h !== void 0 ? _h : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// delete a complain by id
ComplainRouter.delete('/api/complains/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    try {
        const complain = yield complain_1.Complain.findById(req.params.id);
        if (!complain) {
            throw NOT_FOUND;
        }
        const deleteResult = yield complain_1.Complain.deleteOne({ _id: complain._id });
        if (deleteResult.deletedCount !== 1) {
            throw DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while deleting the complain with id: ${req.params.id} due to : ${(_j = error === null || error === void 0 ? void 0 : error.message) !== null && _j !== void 0 ? _j : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
//# sourceMappingURL=complain.js.map