import {Schema, model} from 'mongoose'
import {hash} from 'bcryptjs'
import isEmail from 'validator/lib/isEmail'
import isStrongPassword from 'validator/lib/isStrongPassword'
import { IUser } from './interfaces'
import { NextFunction } from 'express'
import { IdentityCounter } from "./identity-counter";
import { constants } from '../constants'

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
const userSchema = new Schema<IUser>({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true,
        validate: {
            validator (value: string) {
                return isEmail(value)
            },
            message: 'Provided email is invalid!'
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator (value: string){
                return isStrongPassword(value, {
                    minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
                })
            },
            message () {
               return `password is must have atleast 8 characters, atleast 1 uppercase character, atleast 1 lowercase character, atleast 1 digit, atleast 1 symbol`
            }
        }
    },
    gender: {
        type: String,
        required: true,
        enum:[
            constants.USER_GENDER_OPTIONS.MALE,
            constants.USER_GENDER_OPTIONS.FEMALE
        ]
    },
    approved: {
        type: Boolean,
        required: true,
        default:false
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
            constants.USER_LANGUAGE_OPTIONS.FRENCH,
            constants.USER_LANGUAGE_OPTIONS.ENGLISH,
            constants.USER_LANGUAGE_OPTIONS.ENGLISH_FRENCH
        ]
    },
    role: {
        type: String,
        required: true,
        enum: [
            constants.USER_ROLE.TENANT,
            constants.USER_ROLE.LANDLORD,
            constants.USER_ROLE.ADMIN
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
})

userSchema.pre('validate', async function (next: NextFunction) {
    try {
        let doc = this;
        // check if it is a document
        if (doc.isNew) {
            const identity = await IdentityCounter.findOne({model: 'user'});
            if (identity) {
              identity.count = identity.count + 1 ;
              const updatedIdentity =  await identity.save();
              doc.unique_id = updatedIdentity.count;
              next();
            }
            else {
              const identityDocument = new IdentityCounter({
                model: 'user',
                field: 'unique_id'
              }) ;
              doc.unique_id = identityDocument.count;
              next();
            }
        }

    } catch (error) {
        next(error)
    }
})

userSchema.pre('save', async function (next: NextFunction){
    const user: IUser = this

    if (user.isModified('password')) {
        const passwordHash = await hash(user.password, 8)
        user.password = passwordHash
    }
    next()
})


const User = model<IUser>('Users', userSchema)
export {User}