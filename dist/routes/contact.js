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
exports.ContactRouter = void 0;
const express_1 = __importDefault(require("express"));
const error_1 = require("../constants/error");
const auth_middleware_1 = require("../middleware/auth-middleware");
const contact_1 = require("../models/contact");
const mailer_1 = require("../helper/mailer");
const mailer_templates_1 = require("../utils/mailer-templates");
const ContactRouter = express_1.default.Router();
exports.ContactRouter = ContactRouter;
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
// create new contact
ContactRouter.post('/api/contacts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { fullname, email, phone } = req.body;
        const newContact = new contact_1.Contact({
            fullname,
            email,
            phone
        });
        const contact = yield newContact.save();
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/dashboard`;
        const _success = yield (0, mailer_1.mailer)(process.env.SENDGRID_VERIFIED_SENDER, mailer_templates_1.notifyNewContactMe.subject, mailer_templates_1.notifyNewContactMe.heading, mailer_templates_1.notifyNewContactMe.detail, _link, mailer_templates_1.notifyNewContactMe.linkText);
        res.send({ ok: true, data: contact });
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
// get all contact (with or without query string)
ContactRouter.get('/api/contacts', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const contacts = yield contact_1.Contact.find(filter);
        res.send({ ok: true, data: contacts });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// get single contact by id
ContactRouter.get('/api/contacts/:id', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const contact = yield contact_1.Contact.findById(req.params.id);
        if (!contact) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: contact });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
    }
}));
// make contact as replied
ContactRouter.patch('/api/contacts/:id/reply', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const contact = yield contact_1.Contact.findById(req.params.id);
        if (!contact) {
            throw error_1.NOT_FOUND;
        }
        contact.replied = true;
        contact.updated = Date.now();
        const updateContact = yield contact.save();
        res.send({ ok: true, data: updateContact });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
// delete contact
ContactRouter.delete('/api/contacts/:id', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const contact = yield contact_1.Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_e = error.code) !== null && _e !== void 0 ? _e : 1000 });
    }
}));
//# sourceMappingURL=contact.js.map