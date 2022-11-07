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
const middleware_1 = require("../middleware");
const inquiry_1 = require("../models/inquiry");
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
        res.send({ ok: true, data: inquiry });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// get all inquiries (with or without query string)
InquiryRouter.get('/api/inquiries', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get single inquiry by id
InquiryRouter.get('/api/inquiries/:id', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inquiry = yield inquiry_1.Inquiry.findById(req.params.id);
        if (!inquiry) {
            throw new Error('Not Found!');
        }
        res.send({ ok: true, data: inquiry });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// make inquiry as replied
InquiryRouter.patch('/api/inquiries/:id/reply', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inquiry = yield inquiry_1.Inquiry.findById(req.params.id);
        if (!inquiry) {
            throw new Error('Not Found!');
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
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// delete inquiries
InquiryRouter.delete('/api/inquiries/:id', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inquiry = yield inquiry_1.Inquiry.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            throw new Error('Not Found!');
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
//# sourceMappingURL=inquiry.js.map