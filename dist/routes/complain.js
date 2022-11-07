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
const middleware_1 = require("../middleware");
const complain_1 = require("../models/complain");
const ComplainRouter = express_1.default.Router();
exports.ComplainRouter = ComplainRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'processed':
            return { 'replied': value };
        case 'email':
            return { 'email': value };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// create new complain
ComplainRouter.post('/api/complains', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, email, phone, target, subject, message } = req.body;
        const newComplain = new complain_1.Complain({
            fullname,
            email,
            phone,
            target,
            subject,
            message
        });
        const complain = yield newComplain.save();
        res.send({ ok: true, data: complain });
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
// get all complains (with or without query string)
ComplainRouter.get('/api/complains', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get single complain by id
ComplainRouter.get('/api/complains/:id', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complain = yield complain_1.Complain.findById(req.params.id);
        if (!complain) {
            throw new Error('Not Found!');
        }
        res.send({ ok: true, data: complain });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// make complain as processed
ComplainRouter.patch('/api/complains/:id/process', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complain = yield complain_1.Complain.findById(req.params.id);
        if (!complain) {
            throw new Error('Not Found!');
        }
        complain.processed = true;
        complain.updated = Date.now();
        const updateComplain = yield complain.save();
        res.send({ ok: true, data: updateComplain });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// delete a complain by id
ComplainRouter.delete('/api/complains/:id', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complain = yield complain_1.Complain.findByIdAndDelete(req.params.id);
        if (!complain) {
            throw new Error('Not Found!');
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
//# sourceMappingURL=complain.js.map