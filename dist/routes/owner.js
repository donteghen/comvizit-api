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
const owner_1 = require("../models/owner");
const express_1 = __importDefault(require("express"));
const middleware_1 = __importDefault(require("../middleware"));
const OwnerRouter = express_1.default.Router();
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'name':
            return { 'name': { "$regex": value, $options: 'i' } };
        case 'email':
            return { 'email': value };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// get single owner
OwnerRouter.get('/api/owners/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const owner = yield owner_1.Owner.findById(req.params.id);
        if (!owner) {
            throw new Error('Not Found!');
        }
        res.send({ ok: true, data: owner });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// create new owner account
OwnerRouter.post('/api/owners', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, address } = req.body;
        const newOwner = new owner_1.Owner({
            name,
            email,
            phone,
            address
        });
        const owner = yield newOwner.save();
        res.status(201).send({ ok: true, data: owner });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: 'Validation Error!' });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get all owners
OwnerRouter.get('/api/owners', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const owners = yield owner_1.Owner.find();
        res.send({ ok: true, data: owners });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// update owner account
OwnerRouter.put('/api/owners/:id', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, email, phone, address } = req.body;
        const owner = yield owner_1.Owner.findById(req.params.id);
        if (!owner) {
            throw new Error('Requested owner not found!');
        }
        owner.fullname = fullname ? fullname : owner.fullname;
        owner.email = email ? email : owner.email;
        owner.phone = phone ? phone : owner.phone;
        owner.address = address ? address : owner.address;
        const updatedOwner = yield owner.save();
        res.send({ ok: true, data: updatedOwner });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: 'Validation Error!' });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// delete owner account
OwnerRouter.delete('/api/owners/:id', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedOwner = yield owner_1.Owner.findByIdAndDelete(req.params.id);
        if (!deletedOwner) {
            throw new Error('Owner delete operation failed!');
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
//# sourceMappingURL=owner.js.map