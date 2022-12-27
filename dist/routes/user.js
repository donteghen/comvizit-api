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
exports.UserRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../models/user");
const passport_1 = __importDefault(require("passport"));
const auth_middleware_1 = require("../middleware/auth-middleware");
const mongoose_1 = require("mongoose");
const multerUpload_1 = __importDefault(require("../config/multerUpload"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multer_1 = require("multer");
const mailer_1 = require("../helper/mailer");
const mailer_templates_1 = require("../utils/mailer-templates");
const error_1 = require("../constants/error");
const UserRouter = express_1.default.Router();
exports.UserRouter = UserRouter;
function setFilter(key, value) {
    switch (key) {
        case 'fullname':
            return { 'fullname': { "$regex": value, $options: 'i' } };
        case 'email':
            return { 'email': value };
        case 'approved':
            return { 'approved': value };
        case 'isVerified':
            return { 'isVerified': value };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// get landlord's profile of a landlord(for property owner card on client) by id and role === 'LANDLORD'
UserRouter.get('/api/users/landlords/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const query = {
            $and: [
                { _id: new mongoose_1.Types.ObjectId(req.params.id) },
                { role: "LANDLORD" }
            ]
        };
        const landlord = yield user_1.User.findOne(query);
        if (!landlord) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: landlord });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
    }
}));
// Verify newly created account
UserRouter.patch('/api/users/all/:id/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const user = yield user_1.User.findById(req.params.id);
        if (!user) {
            throw error_1.NO_USER;
        }
        user.isVerified = true;
        user.updated = Date.now();
        const updatedUser = yield user.save();
        if (!updatedUser) {
            throw error_1.SAVE_OPERATION_FAILED;
        }
        // Send a welcome email to the verified user
        const link = `${process.env.CLIENT_URL}/profile`;
        const success = yield (0, mailer_1.mailer)(updatedUser.email, mailer_templates_1.welcomeTemplate.subject, mailer_templates_1.welcomeTemplate.heading, mailer_templates_1.welcomeTemplate.detail, link, mailer_templates_1.welcomeTemplate.linkText);
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/dashboard`;
        const senderEmail = process.env.SENDGRID_VERIFIED_SENDER;
        const _success = yield (0, mailer_1.mailer)(senderEmail, mailer_templates_1.notifyAccountVerified.subject, mailer_templates_1.notifyAccountVerified.heading, mailer_templates_1.notifyAccountVerified.detail, _link, mailer_templates_1.notifyAccountVerified.linkText);
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// ***************************** Shared Restricted endpoints ***********************************************
// upload authenticated user's avatar
UserRouter.patch('/api/users/all/:id/avatarUpload', auth_middleware_1.isLoggedIn, multerUpload_1.default.single('avatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    try {
        const user = yield user_1.User.findById(req.params.id);
        if (!user) {
            throw error_1.NO_USER;
        }
        if (user.avatar && user.avatarDeleteId) {
            yield cloudinary_1.default.v2.uploader.destroy(user.avatarDeleteId);
        }
        // select the folder based on user role
        const folderPath = (role) => {
            switch (role) {
                case 'TENANT':
                    return 'Users/Tenants/Avatars/';
                case 'LANDLORD':
                    return 'Users/Landlords/Avatars/';
                case 'ADMIN':
                    return 'Users/Admins/Avatars/';
                default:
                    throw new Error('Invalid user role, avatar upload failed!');
            }
        };
        const result = yield cloudinary_1.default.v2.uploader.upload(req.file.path, { folder: folderPath(user.role),
            public_id: user === null || user === void 0 ? void 0 : user.fullname.replace(' ', '-')
        });
        user.avatar = result.secure_url;
        user.avatarDeleteId = result.public_id;
        user.updated = Date.now();
        const updatedUser = yield user.save();
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        if (error instanceof multer_1.MulterError) {
            res.status(400).send({ ok: false, error: `Multer Upload Error : ${error.message}`, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}`, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_e = error.code) !== null && _e !== void 0 ? _e : 1000 });
    }
}));
// fetch current user session, if any
UserRouter.get('/api/user', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        res.send({ ok: true, data: req.user });
    }
    catch (error) {
        // console.log(error)
        res.status(400).send({ ok: false, error: error.message, code: (_f = error.code) !== null && _f !== void 0 ? _f : 1000 });
    }
}));
// user signup route
UserRouter.post('/api/users/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const { email, password, fullname, lang, role, address, phone } = req.body;
        const newUser = new user_1.User({
            fullname, email, password, lang, role, address, phone
        });
        const user = yield newUser.save();
        // Send an account verification email to new user
        const link = `${process.env.CLIENT_URL}/account-verification?userId=${user.id}`;
        const success = yield (0, mailer_1.mailer)(user.email, mailer_templates_1.verifyAccountTemplate.subject, mailer_templates_1.verifyAccountTemplate.heading, mailer_templates_1.verifyAccountTemplate.detail, link, mailer_templates_1.verifyAccountTemplate.linkText);
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}`;
        const adminEmail = process.env.SENDGRID_VERIFIED_SENDER;
        const _success = yield (0, mailer_1.mailer)(adminEmail, mailer_templates_1.notifyAccountCreated.subject, mailer_templates_1.notifyAccountCreated.heading, mailer_templates_1.notifyAccountCreated.detail, link, mailer_templates_1.notifyAccountCreated.linkText);
        res.send({ ok: true });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_g = error.code) !== null && _g !== void 0 ? _g : 1000 });
    }
}));
// user login route
UserRouter.post('/api/users/login', passport_1.default.authenticate("local", {}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        res.send({ ok: true, data: req.user });
    }
    catch (error) {
        console.log(error);
        res.status(400).send({ ok: false, error: error.message, code: (_h = error.code) !== null && _h !== void 0 ? _h : 1000 });
    }
}));
// user logout route
UserRouter.get('/api/users/logout', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    try {
        req.session.destroy((err) => {
            if (err) {
                throw err;
            }
            res.send({ ok: true });
        });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_j = error.code) !== null && _j !== void 0 ? _j : 1000 });
    }
}));
/*************************** Tenant Restricted router endpoints **************************************** */
// update user profile
UserRouter.patch('/api/users/all/:id/profile/update', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l;
    try {
        const updatedProps = {};
        Object.keys(req.body).forEach(key => {
            updatedProps[key] = req.body[key];
        });
        if (Object.keys(updatedProps).length > 0) {
            updatedProps.updated = Date.now();
        }
        const updatedUser = yield user_1.User.findByIdAndUpdate(req.params.id, { $set: updatedProps }, { runValidators: true });
        if (!updatedUser) {
            throw error_1.USER_UPDATE_OPERATION_FAILED;
        }
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}`, code: (_k = error.code) !== null && _k !== void 0 ? _k : 1000 });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_l = error.code) !== null && _l !== void 0 ? _l : 1000 });
    }
}));
/*************************** Landlord Restricted router endpoints **************************************** */
/*************************** Admin Restricted router endpoints **************************************** */
// get all tenants
UserRouter.get('/api/users/tenants', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _m;
    try {
        let filter = { role: 'TENANT' };
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const tenantUsers = yield user_1.User.find(filter);
        res.send({ ok: true, data: tenantUsers });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_m = error.code) !== null && _m !== void 0 ? _m : 1000 });
    }
}));
// get all landlords
UserRouter.get('/api/users/landlords', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _o;
    try {
        let filter = { role: 'LANDLORD' };
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const landlordUsers = yield user_1.User.find(filter);
        res.send({ ok: true, data: landlordUsers });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_o = error.code) !== null && _o !== void 0 ? _o : 1000 });
    }
}));
// get all admin users
UserRouter.get('/api/users/admins', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _p;
    try {
        let filter = { role: 'ADMIN' };
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const adminUsers = yield user_1.User.find(filter);
        res.send({ ok: true, data: adminUsers });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_p = error.code) !== null && _p !== void 0 ? _p : 1000 });
    }
}));
// approve user's account
UserRouter.patch('/api/users/all/:id/approve', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q, _r;
    try {
        const user = yield user_1.User.findById(req.params.id);
        if (!user) {
            throw error_1.NO_USER;
        }
        user.approved = true;
        user.updated = Date.now();
        const updatedUser = yield user.save();
        // Send an account approved email to user
        const link = `${process.env.CLIENT_URL}/profile`;
        const success = yield (0, mailer_1.mailer)(user.email, mailer_templates_1.notifyAccountApproved.subject, mailer_templates_1.notifyAccountApproved.heading, mailer_templates_1.notifyAccountApproved.detail, link, mailer_templates_1.notifyAccountApproved.linkText);
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        if (error instanceof multer_1.MulterError) {
            res.status(400).send({ ok: false, error: `Multer Upload Error : ${error.message},  code:error.code??1000` });
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}`, code: (_q = error.code) !== null && _q !== void 0 ? _q : 1000 });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_r = error.code) !== null && _r !== void 0 ? _r : 1000 });
    }
}));
// delete user account
UserRouter.delete('/api/user/all/:id', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _s;
    try {
        // make sure that admin can only delete either <user.role === tenant | user.role === landlord>
        // An admin user can be deleted only by the super admin
        const user = yield user_1.User.findById(req.params.id);
        if (user.role === 'ADMIN') {
            throw error_1.NOT_AUTHORIZED;
        }
        const deletedUser = yield user_1.User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_s = error.code) !== null && _s !== void 0 ? _s : 1000 });
    }
}));
//# sourceMappingURL=user.js.map