import express, { Request, Response } from 'express'
import { Types } from 'mongoose';
import { User } from '../models/user';
import { NOT_FOUND, DELETE_OPERATION_FAILED, RENTINTENTION_ALREADY_EXISTS } from '../constants/error';
import { isAdmin, isLoggedIn, isTenant} from '../middleware/auth-middleware';
import { RentIntention } from "../models/rent-intention";
import { rentIntentionLookup, singleRentIntentionLookup } from '../utils/queryMaker';
import { mailer } from '../helper/mailer';
import { notifyNewRentIntentionToAdmin, notifyRentIntentionToLandlord } from '../utils/mailer-templates';
import { logger } from '../logs/logger';


const RentIntentionRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case '_id':
            return {'_id': value}
        case 'propertyId':
            return {'propertyId': new Types.ObjectId(value)}
        case 'landlordId':
            return {'landlordId': new Types.ObjectId(value)}
        case 'potentialTenantId':
            return {'potentialTenantId': new Types.ObjectId(value)}
        case 'status':
            return {'status': value}
        default:
            return {}
    }
}

// ***************************** public enpoints ***********************************************

// ***************************** Shared enpoints ***********************************************

// get  rentIntentions
RentIntentionRouter.get('/api/rent-intentions', isLoggedIn, async (req: Request, res: Response) => {
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
        const rentIntentions = await RentIntention.aggregate(rentIntentionLookup(filter))
        res.send({ok: true, data: rentIntentions})
    } catch (error) {
        logger.error(`An Error occured while querying rent-intention list due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})


// get a rentIntention's detail
RentIntentionRouter.get('/api/rent-intentions/:id', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const rentIntention = await RentIntention.aggregate(singleRentIntentionLookup(req.params.id))
        if (!(rentIntention.length > 0)) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: rentIntention[0]})
    } catch (error) {
        logger.error(`An Error occured while querying the details of the rent-intention with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// ***************************** tenant restricted enpoints ***********************************************

// create a new rent-intension
RentIntentionRouter.post('/api/rent-intentions', isLoggedIn, isTenant, async (req: Request, res: Response) => {
    try {
        const {propertyId, landlordId, comment } = req.body
        // check if this potential tenant already has an initiated rent-intention
        const thrityDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
        const existAlready = await RentIntention.findOne({

                propertyId: new Types.ObjectId(propertyId),
                landlordId: new Types.ObjectId(landlordId),
                potentialTenantId: new Types.ObjectId(req.user.id),
                status: 'INITIATED',
                initiatedAt: {
                    $gt: thrityDaysAgo
                }

        })
        if (existAlready) {
            throw RENTINTENTION_ALREADY_EXISTS
        }
        // a strict casting is added to prevent future bug introduction in the database
        const newRentIntention = new RentIntention({
            propertyId: new Types.ObjectId(propertyId.toString()),
            landlordId: new Types.ObjectId(landlordId.toString()),
            potentialTenantId: new Types.ObjectId(req.user.id),
            comment
        })
        // get the corresponsing landlord so that we can get the fullname to be used in the email template
        const _landlord = await User.findById(landlordId)
        await newRentIntention.save()
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`
        const _success = await mailer(process.env.SENDGRID_VERIFIED_SENDER, notifyNewRentIntentionToAdmin.subject, notifyNewRentIntentionToAdmin.heading,
            notifyNewRentIntentionToAdmin.detail, _link, notifyNewRentIntentionToAdmin.linkText )

        // Send a notification email to landlord
        const link = `${process.env.CLIENT_URL}/profile`
        const {subject, heading, detail, linkText} = notifyRentIntentionToLandlord(_landlord.fullname)
        const success = await mailer(_landlord.email, subject, heading, detail, _link, linkText )
        // send the response
        res.send({ok: true})
    } catch (error) {
        logger.error(`An Error occured while creating a new rent-intention for property with id: ${req.body.propertyId} by user with id: ${req.user.id} due to ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})
// ***************************** Landlord restricted enpoints ***********************************************


// ***************************** Admin restricted enpoints ***********************************************

// update the rent-intension status
RentIntentionRouter.patch('/api/rent-intentions/:id/status-update', isLoggedIn, isAdmin,async (req:Request, res: Response) => {
    try {
        // get the corresponding rent-intension by id
        const rentIntention = await RentIntention.findById(req.params.id)
        if (!rentIntention) {
            throw NOT_FOUND
        }
        rentIntention.status = req.body.status ? req.body.status : rentIntention.status
        await rentIntention.save()
        res.send({ok: true})
    } catch (error) {
        logger.error(`An Error occured while updating the details of the rent-intention with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// delete a rent-intension
RentIntentionRouter.delete('/api/rent-intentions/:id/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const deletedRentIntention = await RentIntention.findById(req.params.id)
        if (!deletedRentIntention) {
            throw NOT_FOUND
        }
        const deleteResult = await RentIntention.deleteOne({_id: deletedRentIntention._id})
        if (deleteResult.deletedCount !== 1) {
            throw DELETE_OPERATION_FAILED
        }

        res.send({ok: true})
    } catch (error) {
        logger.error(`An Error occured while deleting the rent-intention with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

export {RentIntentionRouter}