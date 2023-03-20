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
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = require("bcryptjs");
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
const isStrongPassword_1 = __importDefault(require("validator/lib/isStrongPassword"));
/**
 * User schema, represents the document property definition for a User
 * @constructor User
 * @param {string} fullname - User's full name
 * @param {string} email - User's email
 * @param {string} password - TUser's password
 * @param {string} phone - User's telephone number
 * @param {string} gender - User's gender
 * @param {boolean} approved - User account approved state (approved by admin)
 * @param {boolean} isVerified - User account(email) verification state (verified by user)
 * @param {number} updated - A timestamp in millseconds of the last time this doc was updated
 * @param {string} address.town - User's town
 * @param {string} address.quater - User's quater
 * @param {string} address.street - User's street
 * @param {string} avatar - User's avatar
 * @param {string} avatarDeleteId - User's avatar deletion Id
 * @param {string} role - User's role
 * @param {string} lang - User's spoken language(s)
 * @param {string} favorites - User's (Tenant) favorite properties list
 * @param {string} likes - User's (Tenant) likes collection
 * @param {string} rentIntensions - User's (Tenant) rentIntension activity list
 */
const userSchema = new mongoose_1.Schema({
    fullname: {
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
    gender: {
        type: String,
        required: true,
        enum: ['M', 'F']
    },
    approved: {
        type: Boolean,
        required: true,
        default: false
    },
    address: {
        town: {
            type: String,
            required: true
        },
        quater: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        }
    },
    updated: {
        type: Number,
        required: true,
        default: Date.now()
    },
    avatar: {
        type: String,
    },
    avatarDeleteId: {
        type: String,
    },
    phone: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        required: true,
        enum: ['French', 'English', 'English & French']
    },
    role: {
        type: String,
        required: true,
        enum: ['TENANT', 'LANDLORD', 'ADMIN']
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    favorites: {
        type: [String],
    },
    likes: {
        type: [String]
    },
    rentIntensions: {
        type: [String]
    }
}, {
    virtuals: true,
    timestamps: true
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.isModified('password')) {
            const passwordHash = yield (0, bcryptjs_1.hash)(user.password, 8);
            user.password = passwordHash;
        }
        next();
    });
});
const User = (0, mongoose_1.model)('Users', userSchema);
exports.User = User;
//# sourceMappingURL=user.js.map