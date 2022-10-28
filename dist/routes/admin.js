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
exports.AdminRouter = void 0;
const express_1 = __importDefault(require("express"));
const admin_1 = require("../models/admin");
const passport_1 = __importDefault(require("passport"));
const middleware_1 = require("../middleware");
const AdminRouter = express_1.default.Router();
exports.AdminRouter = AdminRouter;
const auth = 
// admin signup route
AdminRouter.post('/api/admins/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, username } = req.body;
        const newAdmin = new admin_1.Admin({
            username, email, password
        });
        const admin = yield newAdmin.save();
        res.send({ ok: true, data: admin });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// admin login route
AdminRouter.post('/api/admins/login', passport_1.default.authenticate("local", {
    failureRedirect: "/api/",
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send({ ok: true, data: req.user });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// admin logout route
AdminRouter.get('/api/admins/logout', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy((err) => {
            if (err) {
                throw err;
            }
            res.send({ ok: true });
        });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// admin get all admins testing
AdminRouter.get('/api/admins', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield admin_1.Admin.find();
        res.send({ ok: true, data: admins });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
//# sourceMappingURL=admin.js.map