import express, { Request, Response } from 'express'
import {User} from '../models/user'
import passport from 'passport'
import { isLoggedIn, isAdmin } from '../middleware/auth-middleware'
import { Types } from 'mongoose'
import multerUpload from '../config/multerUpload'
import cloudinary from '../config/cloudinary'
import { MulterError } from 'multer'
import { mailer } from '../helper/mailer'
import {welcomeTemplate, notifyAccountCreated, verifyAccountTemplate, notifyAccountApproved, notifyAccountVerified, notifyAccountDisapproved} from '../utils/mailer-templates'
import { ACCOUNST_IS_ALREADY_VERIFIED, DELETE_OPERATION_FAILED, INVALID_REQUEST, INVALID_RESET_TOKEN, NEW_PASSWORD_IS_INVALID, NOT_AUTHORIZED, NOT_FOUND, NO_USER, OLD_PASSWORD_IS_INCORRECT, RESET_TOKEN_DEACTIVED, SAVE_OPERATION_FAILED , USER_UPDATE_OPERATION_FAILED} from '../constants/error'
import {compare} from 'bcryptjs'
import isStrongPassword from 'validator/lib/isStrongPassword'
import { Token } from '../models/token'
import {uuid, isUuid} from 'uuidv4'
import { Property } from '../models/property'
import { Favorite } from '../models/favorite'
import { Like } from '../models/like'
import {Review} from '../models/review'
import {Complain} from '../models/complain'
import {Tag} from '../models/tag'
import { logger } from '../logs/logger'


const UserRouter = express.Router()

function setFilter(key:string, value:any): any {
    switch (key) {
        case 'fullname':
            return {'fullname': { "$regex": value, $options: 'i'}}
        case 'email':
            return {'email': value}
        case 'approved':
            return {'approved': value}
        case 'isVerified':
            return {'isVerified': value}
        default:
            return {}
    }
}


// ***************************** public enpoints ***********************************************

// get landlord's profile of a landlord(for property owner card on client) by id and role === 'LANDLORD'
UserRouter.get('/api/users/landlords/:id/card', async (req: Request, res: Response) => {
    try {
        const query = {
            $and: [
                {_id: new Types.ObjectId(req.params.id)},
                {role: "LANDLORD"}
            ]
        }
        const landlord = await User.findOne(query)
        if (!landlord) {
            throw NO_USER
        }
        const propertyCount = await Property.count({ownerId: landlord._id})
        res.send({ok: true, data: {landlord, propertyCount}})
    } catch (error) {
        // console.log('this is the user router => /api/users/landlords/:id/card: line 61', error)
        logger.error(`An Error occured while getting the landlord\'s card details of the landlord with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok: false, error: error.message, code: error.code??1000})
    }
})

// Verify newly created account
UserRouter.patch('/api/users/all/:id/verify', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            throw NO_USER
        }
        if (user.isVerified) {
            throw ACCOUNST_IS_ALREADY_VERIFIED
        }
        user.isVerified = true
        user.updated = Date.now()

       const updatedUser = await user.save()
        if (!updatedUser) {
            throw SAVE_OPERATION_FAILED
        }
        // Send a welcome email to the verified user
        const link = `${process.env.CLIENT_URL}/profile`
        const success = await mailer(updatedUser.email, welcomeTemplate.subject, welcomeTemplate.heading,
            welcomeTemplate.detail, link, welcomeTemplate.linkText )

        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`
        const senderEmail = process.env.SENDGRID_VERIFIED_SENDER
        const _success = await mailer(senderEmail, notifyAccountVerified.subject, notifyAccountVerified.heading,
             notifyAccountVerified.detail, _link, notifyAccountVerified.linkText )

        res.send({ok:true})
    } catch (error) {
        logger.error(`An Error occured while verifying a newly created account by the user with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})




// reset password endpoint
UserRouter.post('/api/user/reset-password',  async (req: Request, res: Response) => {
    try {
        // console.log(req.body)
        const user = await User.findOne({email:req.body.email})
    if (!user) {
        throw NO_USER
    }
    const generatedToken = new Token({
        owner: user._id,
        secret: uuid(),
        createdAt: Date.now()
    })
    const newToken = await generatedToken.save()
    // notify the user via mail for them to complete the process before the token becomes invalid
    const link = `${process.env.CLIENT_URL}/confirm-reset-password?user=${user.email}&token=${newToken.secret}`
    const success = mailer(user.email, 'User Password Reset', 'You have requested to reset your password', 'A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions. <strong>This operation has an active life cycle 30 minutes!</strong>', link, 'click to continue', )

    res.send({ok:true})
    } catch (error) {
        logger.error(`An Error occured while attempting a password reset by the user with email: ${req.body.email} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }

})

// confirm password reset
UserRouter.post('/api/user/confirm-reset-password', async (req: Request, res: Response) => {
    try {
        const userEmail = req.query.user
        const token = req.query.token
        const {password} = req.body


        if (!isUuid(token.toString())) {
            throw INVALID_RESET_TOKEN
        }
        const user = await User.findOne({email: userEmail})
        if (!user) {
            throw NO_USER
        }

        const resetToken = await Token.findOne({$and: [
            {owner: user._id},
             {secret: token}
        ]})

        if (!resetToken) {
            throw INVALID_REQUEST
        }

        if (Date.now() - resetToken.generatedAt > Number(process.env.PASSWORD_RESET_CYCLE_DURATION)){
            throw RESET_TOKEN_DEACTIVED
        }
        if (!password || !isStrongPassword(password, {minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})) {
            throw NEW_PASSWORD_IS_INVALID
        }
        user.password = password.toString()
        await user.save()
        await Token.deleteMany({owner:user._id})
        res.send({ok:true})
    } catch (error) {
        logger.error(`An Error occured while confirming a password reset by the user with email: ${req.query.user} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

// user signup route
UserRouter.post('/api/users/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, fullname, lang, role, address, phone} = req.body;
        const newUser = new User({
            fullname, email, password, lang, role, address, phone
        })

        const user = await newUser.save()

        // Send an account verification email to new user
        const link = `${process.env.CLIENT_URL}/account-verification?userId=${user.id}`
        const success = await mailer(user.email, verifyAccountTemplate.subject, verifyAccountTemplate.heading,
            verifyAccountTemplate.detail, link, verifyAccountTemplate.linkText )

        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`
        const adminEmail = process.env.SENDGRID_VERIFIED_SENDER
        const _success = await mailer(adminEmail, notifyAccountCreated.subject, notifyAccountCreated.heading,
                notifyAccountCreated.detail, link, notifyAccountCreated.linkText )

        res.send({ok:true})
    } catch (error) {
        logger.error(`An Error occured while signing up a new user with phone number: ${req.body.phone??'N/A'} due to ${error?.message??'Unknown Source'}`)
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code:error.code??1000})
    }
})

// ***************************** Shared Restricted endpoints ***********************************************

// Change user password
UserRouter.post('/api/user/profile/change-password', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            let error = new Error()
            error = NO_USER
            throw error
        }
        const {newPassword, oldPassword} = req.body
        const isMatched = await compare(oldPassword, user.password);

        if (!isMatched){
            throw OLD_PASSWORD_IS_INCORRECT
        }
        if (!isStrongPassword(newPassword, {minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})) {
            throw NEW_PASSWORD_IS_INVALID
        }
        user.password = newPassword
        const updatedUser = await user.save()
        res.send({ok:true, data: updatedUser})
    } catch (error) {
        logger.error(`An Error occured while attepting password change by the user with email: ${req.user.email} and id: ${req.user.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

// upload authenticated user's avatar
UserRouter.patch('/api/user/avatarUpload', isLoggedIn,  multerUpload.single('avatar'), async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({email: req.user.email})
        if (!user) {
            throw NO_USER
        }

        if(user.avatar && user.avatarDeleteId){
            await cloudinary.v2.uploader.destroy(user.avatarDeleteId)
        }
        // select the folder based on user role
        const folderPath = (role: string): string => {
            switch (role) {
                case 'TENANT':
                    return 'Avatars/Users/Tenants'
                case 'LANDLORD':
                    return 'Avatars/Users/Landlords'
                case 'ADMIN':
                    return 'Avatars/Users/Admins'
                default:
                    throw new Error('Invalid user role, avatar upload failed!')
            }
        }
        const result = await cloudinary.v2.uploader.upload(req.file.path,
            { folder: folderPath(user.role),
               public_id: user?.fullname.replace(' ', '-')
            }
        )
        user.avatar = result.secure_url
        user.avatarDeleteId = result.public_id
        user.updated = Date.now()

        const updatedUser = await user.save()

        res.send({ok:true, data: updatedUser})
    } catch (error) {
        logger.error(`An Error occured while uploading avatar by the user with email: ${req.user.email} and id: ${req.user.id} due to ${error?.message??'Unknown Source'}`)
        if (error instanceof MulterError) {
            res.status(400).send({ok: false, error:`Multer Upload Error : ${error.message}`, code:error.code??1000})
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`, code:error.code??1000})
            return
        }
        res.status(400).send({ok:false, error: error.message, code:error.code??1000})
    }
})

// update user profile
UserRouter.patch('/api/users/all/:id/profile/update', isLoggedIn,  async (req: Request, res: Response) => {
    try {
        const updatedProps: any = {}
        Object.keys(req.body).forEach(key => {
            updatedProps[key] = req.body[key]
        })
        if (Object.keys(updatedProps).length > 0) {
            updatedProps.updated = Date.now()
        }
        const userIsUpdated = await User.findByIdAndUpdate(req.params.id, {$set: updatedProps}, {runValidators:true})
        if (!userIsUpdated) {
            throw USER_UPDATE_OPERATION_FAILED
        }
        const updatedUser = await User.findById(req.params.id)
        res.send({ok: true, data: updatedUser})
    } catch (error) {
        logger.error(`An Error occured while profile update by the user with email: ${req.user.email} and id: ${req.user.id} due to ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`, code:error.code??1000})
            return
        }
        res.status(400).send({ok:false, error: error.message, code:error.code??1000})
    }
})

// fetch current user session, if any
UserRouter.get('/api/user', isLoggedIn, async (req: Request, res: Response) => {
try {
    res.send({ok: true, data: req.user})
} catch (error) {
    logger.error(`An Error occured while attepting to fetch the current session user due to ${error?.message??'Unknown Source'}`)
    res.status(400).send({ok:false, error: error.message, code:error.code??1000})
}
})



// user login route
UserRouter.post('/api/users/login', passport.authenticate("local", {failureMessage: true }), async (req: Request, res: Response) => {
    try {
        res.send({ok: true, data: req.user})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code:error.code??1000})
    }
})

// user logout route
UserRouter.get('/api/users/logout', isLoggedIn, async (req: Request, res: Response) => {
    try {
        req.session.destroy((err) => {
            if (err) {
              throw err
            }
            res.send({ok: true})
          });
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code:error.code??1000})
    }
})

/*************************** Tenant Restricted router endpoints **************************************** */




/*************************** Landlord Restricted router endpoints **************************************** */



/*************************** Admin Restricted router endpoints **************************************** */

// get all tenants
UserRouter.get('/api/users/tenants', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        let filter: any = {role: 'TENANT'}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const tenantUsers = await User.find(filter)
        res.send({ok:true, data: tenantUsers})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code:error.code??1000})
    }
})


// get all landlords
UserRouter.get('/api/users/landlords', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        let filter: any = {role: 'LANDLORD'}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const landlordUsers = await User.find(filter)
        res.send({ok:true, data: landlordUsers})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get all admin users
UserRouter.get('/api/users/admins', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        let filter: any = {role: 'ADMIN'}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const adminUsers = await User.find(filter)
        res.send({ok:true, data: adminUsers})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get all users (isrespective of their role)
UserRouter.get('/api/users/all', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        let filter: any = {}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        // console.log(filter)
        const users = await User.find(filter)
        res.send({ok:true, data: users})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// approve user's account
UserRouter.patch('/api/users/all/:id/approve', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        // check if the session user is an admin, if no then it should fail as only an admin can approve a landlord or tenant account
        if (req.user.role !== 'ADMIN') {
            throw NOT_AUTHORIZED
        }
        const user = await User.findById(req.params.id)
        if (!user) {
            throw NO_USER
        }
        // check if the user being approved is an admin, if yes then it should fail as only the superadmin can approve an admin user
        if (user.role === 'ADMIN') {
            throw NOT_AUTHORIZED
        }

        user.approved = true
        user.updated = Date.now()

        const updatedUser = await user.save()

        // Send an account approved email to user
        const link = `${process.env.CLIENT_URL}/profile`
        const success = await mailer(user.email, notifyAccountApproved.subject, notifyAccountApproved.heading,
        notifyAccountApproved.detail, link, notifyAccountApproved.linkText )

        res.send({ok:true, data: updatedUser})
    } catch (error) {

        if (error instanceof MulterError) {
            res.status(400).send({ok: false, error:`Multer Upload Error : ${error.message},  code:error.code??1000`})
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`,  code:error.code??1000})
            return
        }

        res.status(400).send({ok:false, error: error.message, code:error.code??1000})
    }
})


// Disapprove user's account
UserRouter.patch('/api/users/all/:id/disapprove', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        // check if the session user is an admin, if no then it should fail as only an admin can disapprove a landlord or tenant account
        if (req.user.role !== 'ADMIN') {
            throw NOT_AUTHORIZED
        }
        const user = await User.findById(req.params.id)
        if (!user) {
            throw NO_USER
        }
        // check if the user being disapproved is an admin, if yes then it should fail as only the superadmin can approve an admin user
        if (user.role === 'ADMIN') {
            throw NOT_AUTHORIZED
        }

        user.approved = false
        user.updated = Date.now()

        const updatedUser = await user.save()

        // Send an account disapproved email to user
        const link = `${process.env.CLIENT_URL}/inquiry`
        const success = await mailer(user.email, notifyAccountDisapproved.subject, notifyAccountDisapproved.heading,
        notifyAccountDisapproved.detail, link, notifyAccountDisapproved.linkText )

        res.send({ok:true, data: updatedUser})
    } catch (error) {

        if (error instanceof MulterError) {
            res.status(400).send({ok: false, error:`Multer Upload Error : ${error.message},  code:error.code??1000`})
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`,  code:error.code??1000})
            return
        }

        res.status(400).send({ok:false, error: error.message, code:error.code??1000})
    }
})

// delete user account
UserRouter.delete('/api/user/all/:id', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        // make sure that admin can only delete either <user.role === tenant | user.role === landlord>
        // An admin user can be deleted only by the super admin
        const user = await User.findById(req.params.id)
        if (user.role === 'ADMIN') {
            throw NOT_AUTHORIZED
        }
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        if (!deletedUser) {
            throw DELETE_OPERATION_FAILED
        }
        // if user is landlord, then delete all related properties
        if (deletedUser.role === 'LANDLORD') {
            Property.deleteMany({
                ownerId: deletedUser._id
            })
        }
        // unlink and delete tags
        await Tag.deleteMany({
            $and: [
                {type: 'User'},
                {refId: deletedUser._id}
            ]
        })
        // unlink and delete complains
        await Complain.deleteMany({
            plaintiveId: deletedUser._id
        })
        // unlink and delete reviews
        await Review.deleteMany({
            author: deletedUser._id
        })
        // unlink and delete linked favs
        await Favorite.deleteMany({
            _id: {
                $in: deletedUser.favorites?.map(id => new Types.ObjectId(id))
            }
        })
        // unlink and delete linked likes
        await Like.deleteMany({
            _id: {
                $in: deletedUser.likes?.map(id => new Types.ObjectId(id))
            }
        })
        // rent intension comming up
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok: false, error: error.message, code:error.code??1000})
    }
})

export {UserRouter}