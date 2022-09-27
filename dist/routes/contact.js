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
const express_1 = __importDefault(require("express"));
const contact_1 = require("../models/contact");
const middleware_1 = __importDefault(require("../middleware"));
const ContactRouter = express_1.default.Router();
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
    try {
        const { fullname, email, phone } = req.body;
        const newContact = new contact_1.Contact({
            fullname,
            email,
            phone
        });
        const contact = yield newContact.save();
        res.send({ ok: true, data: contact });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: 'Validation Error!' });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// get all contact (with or without query string)
ContactRouter.get('/api/contacts', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const contacts = yield contact_1.Contact.find(setFilter);
        res.send({ ok: true, data: contacts });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get single contact by id
ContactRouter.get('/api/contacts/:id', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contact_1.Contact.findById(req.params.id);
        if (!contact) {
            throw new Error('Not Found!');
        }
        res.send({ ok: true, data: contact });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// make contact as replied
ContactRouter.patch('/api/contacts/:id/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contact_1.Contact.findById(req.params.id);
        if (!contact) {
            throw new Error('Not Found!');
        }
        contact.replied = true;
        const updateContact = yield contact.save();
        res.send({ ok: true, data: updateContact });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: 'Validation Error!' });
            return;
        }
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// delete contact
ContactRouter.delete('/api/contacts/:id/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contact_1.Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            throw new Error('Not Found!');
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
//# sourceMappingURL=contact.js.map