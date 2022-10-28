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
exports.isLoggedIn = exports.passportConfig = void 0;
const passport_local_1 = require("passport-local");
const passport_1 = __importDefault(require("passport"));
const admin_1 = require("./models/admin");
const bcryptjs_1 = require("bcryptjs");
const passportConfig = () => {
    passport_1.default.use(new passport_local_1.Strategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield admin_1.Admin.findOne({ email });
        if (typeof user.approved !== 'boolean' || !user.approved) {
            return done(new Error('Admin permissions pending!'), null);
        }
        if (!user) {
            return done(null, false, { message: "Invalid credentials.\n" });
        }
        if (!(0, bcryptjs_1.compareSync)(password, user.password)) {
            return done(null, false, { message: "Invalid credentials.\n" });
        }
        return done(null, user);
    })));
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield admin_1.Admin.findById(id);
        if (!user) {
            done(new Error('deserialize failed!'), false);
        }
        done(null, user);
    }));
};
exports.passportConfig = passportConfig;
function isLoggedIn(req, res, next) {
    console.log(req.session, req.sessionID, req.isAuthenticated());
    if (!req.isAuthenticated()) {
        throw new Error('Access restricted!');
    }
    next();
}
exports.isLoggedIn = isLoggedIn;
//# sourceMappingURL=middleware.js.map