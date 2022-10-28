import {Schema, model} from 'mongoose'
import {hash} from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import isEmail from 'validator/lib/isEmail'
import isStrongPassword from 'validator/lib/isStrongPassword'
import { IAdmin } from './interfaces'

const adminSchema = new Schema<IAdmin>({
    username: {
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

}, {
    virtuals: true,
    timestamps: true
})


adminSchema.pre('save', async function (next){
    const admin = this

    if (admin.isModified('password')) {
        const passwordHash = await hash(admin.password, 8)
        admin.password = passwordHash
    }
    next()
})

const Admin = model<IAdmin>('Admins', adminSchema)
export {Admin}