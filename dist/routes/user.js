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
const bcryptjs_1 = require("bcryptjs");
const isStrongPassword_1 = __importDefault(require("validator/lib/isStrongPassword"));
const token_1 = require("../models/token");
const uuidv4_1 = require("uuidv4");
const property_1 = require("../models/property");
const favorite_1 = require("../models/favorite");
const like_1 = require("../models/like");
const review_1 = require("../models/review");
const complain_1 = require("../models/complain");
const tag_1 = require("../models/tag");
const logger_1 = require("../logs/logger");
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
UserRouter.get('/api/users/landlords/:id/card', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const query = {
            $and: [
                { _id: new mongoose_1.Types.ObjectId(req.params.id) },
                { role: "LANDLORD" }
            ]
        };
        const landlord = yield user_1.User.findOne(query);
        if (!landlord) {
            throw error_1.NO_USER;
        }
        const propertyCount = yield property_1.Property.count({ ownerId: landlord._id });
        res.send({ ok: true, data: { landlord, propertyCount } });
    }
    catch (error) {
        // console.log('this is the user router => /api/users/landlords/:id/card: line 61', error)
        logger_1.logger.error(`An Error occured while getting the landlord\'s card details of the landlord with id: ${req.params.id} due to ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// Verify newly created account
UserRouter.patch('/api/users/all/:id/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const user = yield user_1.User.findById(req.params.id);
        if (!user) {
            throw error_1.NO_USER;
        }
        if (user.isVerified) {
            throw error_1.ACCOUNST_IS_ALREADY_VERIFIED;
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
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`;
        const senderEmail = process.env.SENDGRID_VERIFIED_SENDER;
        const _success = yield (0, mailer_1.mailer)(senderEmail, mailer_templates_1.notifyAccountVerified.subject, mailer_templates_1.notifyAccountVerified.heading, mailer_templates_1.notifyAccountVerified.detail, _link, mailer_templates_1.notifyAccountVerified.linkText);
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while verifying a newly created account by the user with id: ${req.params.id} due to ${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
// reset password endpoint
UserRouter.post('/api/user/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    try {
        // console.log(req.body)
        const user = yield user_1.User.findOne({ email: req.body.email });
        if (!user) {
            throw error_1.NO_USER;
        }
        const generatedToken = new token_1.Token({
            owner: user._id,
            secret: (0, uuidv4_1.uuid)(),
            createdAt: Date.now()
        });
        const newToken = yield generatedToken.save();
        // notify the user via mail for them to complete the process before the token becomes invalid
        const link = `${process.env.CLIENT_URL}/confirm-reset-password?user=${user.email}&token=${newToken.secret}`;
        const success = (0, mailer_1.mailer)(user.email, 'User Password Reset', 'You have requested to reset your password', 'A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions. <strong>This operation has an active life cycle 30 minutes!</strong>', link, 'click to continue');
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while attempting a password reset by the user with email: ${req.body.email} due to ${(_e = error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_f = error.code) !== null && _f !== void 0 ? _f : 1000 });
    }
}));
// confirm password reset
UserRouter.post('/api/user/confirm-reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    try {
        const userEmail = req.query.user;
        const token = req.query.token;
        const { password } = req.body;
        if (!(0, uuidv4_1.isUuid)(token.toString())) {
            throw error_1.INVALID_RESET_TOKEN;
        }
        const user = yield user_1.User.findOne({ email: userEmail });
        if (!user) {
            throw error_1.NO_USER;
        }
        const resetToken = yield token_1.Token.findOne({ $and: [
                { owner: user._id },
                { secret: token }
            ] });
        if (!resetToken) {
            throw error_1.INVALID_REQUEST;
        }
        if (Date.now() - resetToken.generatedAt > Number(process.env.PASSWORD_RESET_CYCLE_DURATION)) {
            throw error_1.RESET_TOKEN_DEACTIVED;
        }
        if (!password || !(0, isStrongPassword_1.default)(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
            throw error_1.NEW_PASSWORD_IS_INVALID;
        }
        user.password = password.toString();
        yield user.save();
        yield token_1.Token.deleteMany({ owner: user._id });
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while confirming a password reset by the user with email: ${req.query.user} due to ${(_g = error === null || error === void 0 ? void 0 : error.message) !== null && _g !== void 0 ? _g : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_h = error.code) !== null && _h !== void 0 ? _h : 1000 });
    }
}));
// user signup route
UserRouter.post('/api/users/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l;
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
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`;
        const adminEmail = process.env.SENDGRID_VERIFIED_SENDER;
        const _success = yield (0, mailer_1.mailer)(adminEmail, mailer_templates_1.notifyAccountCreated.subject, mailer_templates_1.notifyAccountCreated.heading, mailer_templates_1.notifyAccountCreated.detail, link, mailer_templates_1.notifyAccountCreated.linkText);
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while signing up a new user with phone number: ${(_j = req.body.phone) !== null && _j !== void 0 ? _j : 'N/A'} due to ${(_k = error === null || error === void 0 ? void 0 : error.message) !== null && _k !== void 0 ? _k : 'Unknown Source'}`);
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_l = error.code) !== null && _l !== void 0 ? _l : 1000 });
    }
}));
// ***************************** Shared Restricted endpoints ***********************************************
// Change user password
UserRouter.post('/api/user/profile/change-password', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o;
    try {
        const user = yield user_1.User.findById(req.user.id);
        if (!user) {
            let error = new Error();
            error = error_1.NO_USER;
            throw error;
        }
        const { newPassword, oldPassword } = req.body;
        const isMatched = yield (0, bcryptjs_1.compare)(oldPassword, user.password);
        if (!isMatched) {
            throw error_1.OLD_PASSWORD_IS_INCORRECT;
        }
        if (!(0, isStrongPassword_1.default)(newPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
            throw error_1.NEW_PASSWORD_IS_INVALID;
        }
        user.password = newPassword;
        const updatedUser = yield user.save();
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while attepting password change by the user with email: ${req.user.email} and id: ${req.user.id} due to ${(_m = error === null || error === void 0 ? void 0 : error.message) !== null && _m !== void 0 ? _m : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_o = error.code) !== null && _o !== void 0 ? _o : 1000 });
    }
}));
// upload authenticated user's avatar
UserRouter.patch('/api/user/avatarUpload', auth_middleware_1.isLoggedIn, multerUpload_1.default.single('avatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _p, _q, _r, _s;
    try {
        const user = yield user_1.User.findOne({ email: req.user.email });
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
                    return 'Avatars/Users/Tenants';
                case 'LANDLORD':
                    return 'Avatars/Users/Landlords';
                case 'ADMIN':
                    return 'Avatars/Users/Admins';
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
        logger_1.logger.error(`An Error occured while uploading avatar by the user with email: ${req.user.email} and id: ${req.user.id} due to ${(_p = error === null || error === void 0 ? void 0 : error.message) !== null && _p !== void 0 ? _p : 'Unknown Source'}`);
        if (error instanceof multer_1.MulterError) {
            res.status(400).send({ ok: false, error: `Multer Upload Error : ${error.message}`, code: (_q = error.code) !== null && _q !== void 0 ? _q : 1000 });
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}`, code: (_r = error.code) !== null && _r !== void 0 ? _r : 1000 });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_s = error.code) !== null && _s !== void 0 ? _s : 1000 });
    }
}));
// update user profile
UserRouter.patch('/api/users/all/:id/profile/update', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _t, _u, _v;
    try {
        const updatedProps = {};
        Object.keys(req.body).forEach(key => {
            updatedProps[key] = req.body[key];
        });
        if (Object.keys(updatedProps).length > 0) {
            updatedProps.updated = Date.now();
        }
        const userIsUpdated = yield user_1.User.findByIdAndUpdate(req.params.id, { $set: updatedProps }, { runValidators: true });
        if (!userIsUpdated) {
            throw error_1.USER_UPDATE_OPERATION_FAILED;
        }
        const updatedUser = yield user_1.User.findById(req.params.id);
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while profile update by the user with email: ${req.user.email} and id: ${req.user.id} due to ${(_t = error === null || error === void 0 ? void 0 : error.message) !== null && _t !== void 0 ? _t : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}`, code: (_u = error.code) !== null && _u !== void 0 ? _u : 1000 });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_v = error.code) !== null && _v !== void 0 ? _v : 1000 });
    }
}));
// fetch current user session, if any
UserRouter.get('/api/user', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _w, _x;
    try {
        res.send({ ok: true, data: req.user });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while attepting to fetch the current session user due to ${(_w = error === null || error === void 0 ? void 0 : error.message) !== null && _w !== void 0 ? _w : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error.message, code: (_x = error.code) !== null && _x !== void 0 ? _x : 1000 });
    }
}));
// user login route
UserRouter.post('/api/users/login', passport_1.default.authenticate("local", { failureMessage: true }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _y;
    try {
        res.send({ ok: true, data: req.user });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_y = error.code) !== null && _y !== void 0 ? _y : 1000 });
    }
}));
// user logout route
UserRouter.get('/api/users/logout', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _z;
    try {
        req.session.destroy((err) => {
            if (err) {
                throw err;
            }
            res.send({ ok: true });
        });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_z = error.code) !== null && _z !== void 0 ? _z : 1000 });
    }
}));
/*************************** Tenant Restricted router endpoints **************************************** */
/*************************** Landlord Restricted router endpoints **************************************** */
/*************************** Admin Restricted router endpoints **************************************** */
// get all tenants
UserRouter.get('/api/users/tenants', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _0;
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
        res.status(400).send({ ok: false, error: error.message, code: (_0 = error.code) !== null && _0 !== void 0 ? _0 : 1000 });
    }
}));
// get all landlords
UserRouter.get('/api/users/landlords', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _1;
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
        res.status(400).send({ ok: false, error: error.message, code: (_1 = error.code) !== null && _1 !== void 0 ? _1 : 1000 });
    }
}));
// get all admin users
UserRouter.get('/api/users/admins', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _2;
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
        res.status(400).send({ ok: false, error: error.message, code: (_2 = error.code) !== null && _2 !== void 0 ? _2 : 1000 });
    }
}));
// get all users (isrespective of their role)
UserRouter.get('/api/users/all', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _3;
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
        // console.log(filter)
        const users = yield user_1.User.find(filter);
        res.send({ ok: true, data: users });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_3 = error.code) !== null && _3 !== void 0 ? _3 : 1000 });
    }
}));
// approve user's account
UserRouter.patch('/api/users/all/:id/approve', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _4, _5;
    try {
        // check if the session user is an admin, if no then it should fail as only an admin can approve a landlord or tenant account
        if (req.user.role !== 'ADMIN') {
            throw error_1.NOT_AUTHORIZED;
        }
        const user = yield user_1.User.findById(req.params.id);
        if (!user) {
            throw error_1.NO_USER;
        }
        // check if the user being approved is an admin, if yes then it should fail as only the superadmin can approve an admin user
        if (user.role === 'ADMIN') {
            throw error_1.NOT_AUTHORIZED;
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
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}`, code: (_4 = error.code) !== null && _4 !== void 0 ? _4 : 1000 });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_5 = error.code) !== null && _5 !== void 0 ? _5 : 1000 });
    }
}));
// Disapprove user's account
UserRouter.patch('/api/users/all/:id/disapprove', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _6, _7;
    try {
        // check if the session user is an admin, if no then it should fail as only an admin can disapprove a landlord or tenant account
        if (req.user.role !== 'ADMIN') {
            throw error_1.NOT_AUTHORIZED;
        }
        const user = yield user_1.User.findById(req.params.id);
        if (!user) {
            throw error_1.NO_USER;
        }
        // check if the user being disapproved is an admin, if yes then it should fail as only the superadmin can approve an admin user
        if (user.role === 'ADMIN') {
            throw error_1.NOT_AUTHORIZED;
        }
        user.approved = false;
        user.updated = Date.now();
        const updatedUser = yield user.save();
        // Send an account disapproved email to user
        const link = `${process.env.CLIENT_URL}/inquiry`;
        const success = yield (0, mailer_1.mailer)(user.email, mailer_templates_1.notifyAccountDisapproved.subject, mailer_templates_1.notifyAccountDisapproved.heading, mailer_templates_1.notifyAccountDisapproved.detail, link, mailer_templates_1.notifyAccountDisapproved.linkText);
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        if (error instanceof multer_1.MulterError) {
            res.status(400).send({ ok: false, error: `Multer Upload Error : ${error.message},  code:error.code??1000` });
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}`, code: (_6 = error.code) !== null && _6 !== void 0 ? _6 : 1000 });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_7 = error.code) !== null && _7 !== void 0 ? _7 : 1000 });
    }
}));
// delete user account
UserRouter.delete('/api/user/all/:id', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _8, _9, _10;
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
        // if user is landlord, then delete all related properties
        if (deletedUser.role === 'LANDLORD') {
            property_1.Property.deleteMany({
                ownerId: deletedUser._id
            });
        }
        // unlink and delete tags
        yield tag_1.Tag.deleteMany({
            $and: [
                { type: 'User' },
                { refId: deletedUser._id }
            ]
        });
        // unlink and delete complains
        yield complain_1.Complain.deleteMany({
            plaintiveId: deletedUser._id
        });
        // unlink and delete reviews
        yield review_1.Review.deleteMany({
            author: deletedUser._id
        });
        // unlink and delete linked favs
        yield favorite_1.Favorite.deleteMany({
            _id: {
                $in: (_8 = deletedUser.favorites) === null || _8 === void 0 ? void 0 : _8.map(id => new mongoose_1.Types.ObjectId(id))
            }
        });
        // unlink and delete linked likes
        yield like_1.Like.deleteMany({
            _id: {
                $in: (_9 = deletedUser.likes) === null || _9 === void 0 ? void 0 : _9.map(id => new mongoose_1.Types.ObjectId(id))
            }
        });
        // rent intension comming up
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_10 = error.code) !== null && _10 !== void 0 ? _10 : 1000 });
    }
}));
//# sourceMappingURL=user.js.map