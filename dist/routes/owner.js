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
exports.OwnerRouter = void 0;
const owner_1 = require("../models/owner");
const express_1 = __importDefault(require("express"));
const multerUpload_1 = __importDefault(require("../config/multerUpload"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multer_1 = require("multer");
const auth_middleware_1 = require("../middleware/auth-middleware");
const OwnerRouter = express_1.default.Router();
exports.OwnerRouter = OwnerRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'fullname':
            return { 'fullname': { "$regex": value, $options: 'i' } };
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
OwnerRouter.post('/api/owners', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, email, phone, address, lang } = req.body;
        const newOwner = new owner_1.Owner({
            fullname,
            email,
            phone,
            address
        });
        const owner = yield newOwner.save();
        res.status(201).send({ ok: true, data: owner });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get all owners
OwnerRouter.get('/api/owners', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const owners = yield owner_1.Owner.find(filter);
        res.send({ ok: true, data: owners });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// upload owner avatar
OwnerRouter.patch('/api/owners/:id/avatarUpload', auth_middleware_1.isLoggedIn, multerUpload_1.default.single('avatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const owner = yield owner_1.Owner.findById(req.params.id);
        if (!owner) {
            throw new Error('Owner not found!');
        }
        if (owner.avatar) {
            yield cloudinary_1.default.v2.uploader.destroy(owner.avatarDeleteId);
        }
        const result = yield cloudinary_1.default.v2.uploader.upload(req.file.path, { folder: "Owners/Avatars/",
            public_id: owner === null || owner === void 0 ? void 0 : owner.fullname.replace(' ', '-')
        });
        owner.avatar = result.secure_url;
        owner.avatarDeleteId = result.public_id;
        owner.updated = Date.now();
        const updatedOwner = yield owner.save();
        res.send({ ok: true, data: updatedOwner });
    }
    catch (error) {
        if (error instanceof multer_1.MulterError) {
            res.status(400).send({ ok: false, error: `Multer Upload Error : ${error.message}` });
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// update owner account
OwnerRouter.patch('/api/owners/:id', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = {};
        Object.keys(req.body).forEach(key => {
            update[key] = req.body[key];
        });
        if (Object.keys(update).length > 0) {
            update.updated = Date.now();
        }
        const updatedOwner = yield owner_1.Owner.findByIdAndUpdate(req.params.id, { $set: update }, { runValidators: true });
        if (!updatedOwner) {
            throw new Error('Update request failed!');
        }
        res.send({ ok: true, data: updatedOwner });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// delete owner account
OwnerRouter.delete('/api/owners/:id', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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