import {Schema, model} from 'mongoose'
import {hash} from 'bcryptjs'
import isEmail from 'validator/lib/isEmail'
import isStrongPassword from 'validator/lib/isStrongPassword'
import { IUser } from './interfaces'
import { NextFunction } from 'express'


/**
 * User schema, represents the document property definition for a User
 * @constructor User
 * @param {string} fullname - User's full name
 * @param {string} email - User's email
 * @param {string} password - TUser's password
 * @param {string} phone - User's telephone number
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