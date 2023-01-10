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
exports.isAdmin = exports.isLandlord = exports.isTenant = exports.isLoggedIn = exports.passportConfig = void 0;
const passport_local_1 = require("passport-local");
const passport_1 = __importDefault(require("passport"));
const user_1 = require("../models/user");
const bcryptjs_1 = require("bcryptjs");
const passportConfig = () => {
    passport_1.default.use(new passport_local_1.Strategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_1.User.findOne({ email });
        if (!user) {
            return done(null, false, { message: "Invalid credentials.\n" });
        }
        if (!(0, bcryptjs_1.compareSync)(password, user.password)) {
            // console.log('Wrong password!')
            return done(null, false, { message: "Invalid credentials.\n" });
        }
        if (typeof user.approved !== 'boolean' || !user.approved) {
            return done(null, false, { message: "User permissions pending!" });
        }
        if (typeof user.isVerified !== 'boolean' || !user.isVerified) {
            return done(null, false, { message: "User account is not yet verified!" });
        }
        return done(null, user);
    })));
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_1.User.findById(id);
        if (!user) {
            done(new Error('deserialize failed!'), false);
        }
        done(null, user);
    }));
};
exports.passportConfig = passportConfig;
// helper function that checks if user is authenticated
function isLoggedIn(req, res, next) {
    // console.log(req.sessionID, req.isAuthenticated(), req.user)
    if (!req.isAuthenticated()) {
        next('Access restricted!');
    }
    next();
}
exports.isLoggedIn = isLoggedIn;
// helper function that checks if an authenticated user is a tenant
function isTenant(req, res, next) {
    if (req.user.role !== 'TENANT') {
        next('Access restricted to approved and authenticated tenants only!');
    }
    next();
}
exports.isTenant = isTenant;
// helper function that checks if an authenticated user is a landlord
function isLandlord(req, res, next) {
    if (req.user.role !== 'LANDLORD') {
        next('Access restricted to approved and authenticated landlords only!');
    }
    next();
}
exports.isLandlord = isLandlord;
// helper function that checks if an authenticated user is an admin
function isAdmin(req, res, next) {
    if (req.user.role !== 'ADMIN') {
        next('Access restricted to admins only!');
    }
    next();
}
exports.isAdmin = isAdmin;
//# sourceMappingURL=auth-middleware.js.map