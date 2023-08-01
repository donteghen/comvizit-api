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
exports.InquiryRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth-middleware");
const inquiry_1 = require("../models/inquiry");
const mailer_1 = require("../helper/mailer");
const mailer_templates_1 = require("../utils/mailer-templates");
const error_1 = require("../constants/error");
const logger_1 = require("../logs/logger");
const date_query_setter_1 = require("../utils/date-query-setter");
const InquiryRouter = express_1.default.Router();
exports.InquiryRouter = InquiryRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'unique_id':
            return { unique_id: Number(value) };
        case 'replied':
            return { 'replied': value };
        case 'email':
            return { 'email': value };
        case 'fullname':
            return { 'fullname': { "$regex": value, $options: 'i' } };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// create new inquiry
InquiryRouter.post('/api/inquiries', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { fullname, email, phone, subject, message } = req.body;
        const newInquiry = new inquiry_1.Inquiry({
            fullname,
            email,
            phone,
            subject,
            message
        });
        const inquiry = yield newInquiry.save();
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`;
        const _success = yield (0, mailer_1.mailer)(process.env.SENDGRID_VERIFIED_SENDER, mailer_templates_1.notifyNewInquiry.subject, mailer_templates_1.notifyNewInquiry.heading, mailer_templates_1.notifyNewInquiry.detail, _link, mailer_templates_1.notifyNewInquiry.linkText);
        res.send({ ok: true, data: inquiry });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while creating a new inquiry due to ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// get all inquiries (with or without query string)
InquiryRouter.get('/api/inquiries', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const inquiries = yield inquiry_1.Inquiry.find(filter);
        res.send({ ok: true, data: inquiries });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying inquiry collection due to ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get single inquiry by id
InquiryRouter.get('/api/inquiries/:id', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const inquiry = yield inquiry_1.Inquiry.findById(req.params.id);
        if (!inquiry) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: inquiry });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while getting the details of the inquiry with id: ${req.params.id} due to ${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// make inquiry as replied
InquiryRouter.patch('/api/inquiries/:id/reply', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const inquiry = yield inquiry_1.Inquiry.findById(req.params.id);
        if (!inquiry) {
            throw error_1.NOT_FOUND;
        }
        inquiry.replied = true;
        inquiry.updated = Date.now();
        const updateInquiry = yield inquiry.save();
        res.send({ ok: true, data: updateInquiry });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while updating the replied status of the inquiry with id: ${req.params.id} due to ${(_d = error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// delete inquiries
InquiryRouter.delete('/api/inquiries/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const inquiry = yield inquiry_1.Inquiry.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while deleting the inquiry with id: ${req.params.id} due to ${(_e = error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=inquiry.js.map