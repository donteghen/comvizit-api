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
const error_1 = require("../constants/error");
const auth_middleware_1 = require("../middleware/auth-middleware");
const complain_1 = require("../models/complain");
const mailer_1 = require("../helper/mailer");
const mailer_templates_1 = require("../utils/mailer-templates");
const mongoose_1 = require("mongoose");
const ComplainRouter = express_1.default.Router();
exports.ComplainRouter = ComplainRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case '_id':
            return { '_id': value };
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
        case 'plaintiveId':
            return { 'plaintiveId': new mongoose_1.Types.ObjectId(value) };
        case 'targetId':
            return { 'targetId': new mongoose_1.Types.ObjectId(value) };
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
        console.log(error);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// get all complains (with or without query string)
ComplainRouter.get('/api/complains', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
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
        const complains = yield complain_1.Complain.find(filter);
        res.send({ ok: true, data: complains });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// get single complain by id
ComplainRouter.get('/api/complains/:id', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complain = yield complain_1.Complain.findById(req.params.id);
        if (!complain) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: complain });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// make complain as processed
ComplainRouter.patch('/api/complains/:id/process', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const complain = yield complain_1.Complain.findById(req.params.id);
        if (!complain) {
            throw error_1.NOT_FOUND;
        }
        complain.processed = true;
        complain.updated = Date.now();
        const updateComplain = yield complain.save();
        res.send({ ok: true, data: updateComplain });
    }
    catch (error) {
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
    }
}));
// delete a complain by id
ComplainRouter.delete('/api/complains/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complain = yield complain_1.Complain.findById(req.params.id);
        if (!complain) {
            throw error_1.NOT_FOUND;
        }
        const deleteResult = yield complain_1.Complain.deleteOne({ _id: complain._id });
        if (deleteResult.deletedCount !== 1) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
//# sourceMappingURL=complain.js.map