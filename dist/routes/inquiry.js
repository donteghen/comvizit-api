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
const InquiryRouter = express_1.default.Router();
exports.InquiryRouter = InquiryRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'replied':
            return { 'replied': value };
        case 'email':
            return { 'email': value };
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
        const _link = `${process.env.CLIENT_URL}/dashboard`;
        const _success = yield (0, mailer_1.mailer)(process.env.SENDGRID_VERIFIED_SENDER, mailer_templates_1.notifyNewInquiry.subject, mailer_templates_1.notifyNewInquiry.heading, mailer_templates_1.notifyNewInquiry.detail, _link, mailer_templates_1.notifyNewInquiry.linkText);
        res.send({ ok: true, data: inquiry });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
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
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const inquiries = yield inquiry_1.Inquiry.find(filter);
        res.send({ ok: true, data: inquiries });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
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
        res.status(400).send({ ok: false, error: error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
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
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
// delete inquiries
InquiryRouter.delete('/api/inquiries/:id', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const inquiry = yield inquiry_1.Inquiry.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_e = error.code) !== null && _e !== void 0 ? _e : 1000 });
    }
}));
//# sourceMappingURL=inquiry.js.map