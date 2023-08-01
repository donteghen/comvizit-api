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
const logger_1 = require("../logs/logger");
const date_query_setter_1 = require("../utils/date-query-setter");
const ContactRouter = express_1.default.Router();
exports.ContactRouter = ContactRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'unique_id':
            return { unique_id: Number(value) };
        case 'replied':
            return { 'replied': value };
        case 'fullname':
            return { fullname: { "$regex": value, $options: 'i' } };
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
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`;
        const _success = yield (0, mailer_1.mailer)(process.env.SENDGRID_VERIFIED_SENDER, mailer_templates_1.notifyNewContactMe.subject, mailer_templates_1.notifyNewContactMe.heading, mailer_templates_1.notifyNewContactMe.detail, _link, mailer_templates_1.notifyNewContactMe.linkText);
        res.send({ ok: true, data: contact });
    }
    catch (error) {
        console.log(error);
        logger_1.logger.error(`An error occured while creating a new contactme message due to : ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// get all contact (with or without query string)
ContactRouter.get('/api/contacts', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f;
    try {
        let filter = {};
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
        const contacts = yield contact_1.Contact.find(filter);
        res.send({ ok: true, data: contacts });
    }
    catch (error) {
        logger_1.logger.error(`An error occured querying contactme list due to : ${(_f = error === null || error === void 0 ? void 0 : error.message) !== null && _f !== void 0 ? _f : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get single contact by id
ContactRouter.get('/api/contacts/:id', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const contact = yield contact_1.Contact.findById(req.params.id);
        if (!contact) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: contact });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while querying the contactme details with id: ${req.params.id} due to : ${(_g = error === null || error === void 0 ? void 0 : error.message) !== null && _g !== void 0 ? _g : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// make contact as replied
ContactRouter.patch('/api/contacts/:id/reply', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
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
        logger_1.logger.error(`An error occured while updating the replied status of the contactme with id: ${req.params.id} due to : ${(_h = error === null || error === void 0 ? void 0 : error.message) !== null && _h !== void 0 ? _h : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// delete contact
ContactRouter.delete('/api/contacts/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    try {
        const contact = yield contact_1.Contact.findById(req.params.id);
        if (!contact) {
            throw error_1.NOT_FOUND;
        }
        const deleteResult = yield contact_1.Contact.deleteOne({ _id: contact._id });
        if (deleteResult.deletedCount !== 1) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An error occured while deleting the contactme message with id: ${req.params.id} due to : ${(_j = error === null || error === void 0 ? void 0 : error.message) !== null && _j !== void 0 ? _j : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=contact.js.map