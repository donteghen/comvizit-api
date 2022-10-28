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
exports.Admin = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = require("bcryptjs");
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
const isStrongPassword_1 = __importDefault(require("validator/lib/isStrongPassword"));
const adminSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator(value) {
                return (0, isEmail_1.default)(value);
            },
            message: 'Provided email is invalid!'
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator(value) {
                return (0, isStrongPassword_1.default)(value, {
                    minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
                });
            },
            message() {
                return `password is must have atleast 8 characters, atleast 1 uppercase character, atleast 1 lowercase character, atleast 1 digit, atleast 1 symbol`;
            }
        }
    },
    approved: {
        type: Boolean,
        required: true,
        default: false
    },
}, {
    virtuals: true,
    timestamps: true
});
adminSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const admin = this;
        if (admin.isModified('password')) {
            const passwordHash = yield (0, bcryptjs_1.hash)(admin.password, 8);
            admin.password = passwordHash;
        }
        next();
    });
});
const Admin = (0, mongoose_1.model)('Admins', adminSchema);
exports.Admin = Admin;
//# sourceMappingURL=admin.js.map