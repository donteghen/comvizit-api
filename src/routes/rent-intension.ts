import express, { Request, Response } from 'express'
import { Types } from 'mongoose';
import { Property } from '../models/property';
import { User } from '../models/user';
import { NOT_FOUND, SAVE_OPERATION_FAILED, DELETE_OPERATION_FAILED, RENTINTENSION_ALREADY_EXISTS } from '../constants/error';
import { isAdmin, isLoggedIn, isTenant} from '../middleware/auth-middleware';
import { RentIntension } from "../models/rent-intension";
import { rentIntensionLookup } from '../utils/queryMaker';
import { mailer } from '../helper/mailer';
import { notifyNewRentIntensionToAdmin, notifyRentIntensionToLandlord } from '../utils/mailer-templates';


const RentIntensionRouter = express.Router()

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



// ***************************** tenant restricted enpoints ***********************************************

// create a new rent-intension
RentIntensionRouter.post('/api/rent-intensions', async (req: Request, res: Response) => {
    try {
        const {propertyId, landlordId, potentialTenantId, comment } = req.body
        // check if this potential tenant already has an initiated rent-intention
        const thrityDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
        const existAlready = await RentIntension.findOne({
            $and: [
                {propertyId: new Types.ObjectId(propertyId)},
                {landlordId: new Types.ObjectId(landlordId)},
                {potentialTenantId: new Types.ObjectId(potentialTenantId)},
                {status:
                    {$ne: 'INITIATED'}
                },
                {initiatedAt: {
                    $lt: thrityDaysAgo
                }}
            ]
        })
        if (existAlready) {
            throw RENTINTENSION_ALREADY_EXISTS
        }
        const newRentIntension = new RentIntension({
            propertyId,
            landlordId,
            potentialTenantId,
            comment
        })
        // get the corresponsing landlord so that we can get the fullname to be used in the email template
        const _landlord = await User.findById(landlordId)
        await newRentIntension.save()
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`
        const _success = await mailer(process.env.SENDGRID_VERIFIED_SENDER, notifyNewRentIntensionToAdmin.subject, notifyNewRentIntensionToAdmin.heading,
            notifyNewRentIntensionToAdmin.detail, _link, notifyNewRentIntensionToAdmin.linkText )

        // Send a notification email to landlord
        const link = `${process.env.CLIENT_URL}/profile`
        const {subject, heading, detail, linkText} = notifyRentIntensionToLandlord(_landlord.fullname)
        const success = await mailer(_landlord.email, subject, heading, detail, _link, linkText )
        // send the response
        res.send({ok: true})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})
// ***************************** Landlord restricted enpoints ***********************************************


// ***************************** Admin restricted enpoints ***********************************************
// get all rentIntensions
RentIntensionRouter.get('/api/rent-intensions', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
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
        const rentIntensions = await RentIntension.aggregate(rentIntensionLookup(filter))
        res.send({ok: true, data: rentIntensions})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})


// delete a rent-intension
RentIntensionRouter.delete('/api/rent-intensions/:id/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const deletedRentIntension = await RentIntension.findById(req.params.id)
        if (!deletedRentIntension) {
            throw NOT_FOUND
        }
        const deleteResult = await RentIntension.deleteOne({_id: deletedRentIntension._id})
        if (deleteResult.deletedCount !== 1) {
            throw DELETE_OPERATION_FAILED
        }

        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

export {RentIntensionRouter}