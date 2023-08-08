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
const identity_counter_1 = require("./identity-counter");
const constants_1 = require("../constants");
/**
 * User schema, represents the document property definition for a User
 * @constructor User
 * @property {string} fullname - User's full name
 * @property {string} email - User's email
 * @property {string} password - TUser's password
 * @property {string} phone - User's telephone number
 * @property {string} gender - User's gender
 * @property {boolean} approved - User account approved state (approved by admin)
 * @property {boolean} isVerified - User account(email) verification state (verified by user)
 * @property {number} updated - A timestamp in millseconds of the last time this doc was updated
 * @property {string} address.town - User's town
 * @property {string} address.quater - User's quater
 * @property {string} address.street - User's street
 * @property {string} avatar - User's avatar
 * @property {string} avatarDeleteId - User's avatar deletion Id
 * @property {string} role - User's role
 * @property {string} lang - User's spoken language(s)
 * @property {string} favorites - User's (Tenant) favorite properties list
 * @property {string} likes - User's (Tenant) likes collection
 * @property {number} unique_id - User's unique id
 * @property {boolean} isOnline - User's online status
 * @property {Date} lastOnlineDate - User's last heatbeat from chat
 * @property {Date} lastMessageDate - date when the user send/recieved the last chat message
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
        enum: [
            constants_1.constants.USER_GENDER_OPTIONS.MALE,
            constants_1.constants.USER_GENDER_OPTIONS.FEMALE
        ]
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
        enum: [
            constants_1.constants.USER_LANGUAGE_OPTIONS.FRENCH,
            constants_1.constants.USER_LANGUAGE_OPTIONS.ENGLISH,
            constants_1.constants.USER_LANGUAGE_OPTIONS.ENGLISH_FRENCH
        ]
    },
    role: {
        type: String,
        required: true,
        enum: [
            constants_1.constants.USER_ROLE.TENANT,
            constants_1.constants.USER_ROLE.LANDLORD,
            constants_1.constants.USER_ROLE.ADMIN
        ]
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
    unique_id: {
        type: Number,
        required: true,
        unique: true
    },
    isOnline: {
        type: Boolean,
        required: true,
        default: false
    },
    lastOnlineDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastMessageDate: {
        type: Date,
        default: null
    }
}, {
    virtuals: true,
    timestamps: true
});
userSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let doc = this;
            // check if it is a document
            if (doc.isNew) {
                const identity = yield identity_counter_1.IdentityCounter.findOne({ model: 'user' });
                if (identity) {
                    identity.count = identity.count + 1;
                    const updatedIdentity = yield identity.save();
                    doc.unique_id = updatedIdentity.count;
                    next();
                }
                else {
                    const identityDocument = new identity_counter_1.IdentityCounter({
                        model: 'user',
                        field: 'unique_id'
                    });
                    doc.unique_id = identityDocument.count;
                    next();
                }
            }
        }
        catch (error) {
            next(error);
        }
    });
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