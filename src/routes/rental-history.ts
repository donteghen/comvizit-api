import express, { Request, Response } from 'express'
import { Types } from 'mongoose';
import { DELETE_OPERATION_FAILED, INVALID_REQUEST, NOT_FOUND, RENTALHISTORY_CURRENTLY_ONGOING, SAVE_OPERATION_FAILED } from '../constants/error';
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { RentalHistory } from "../models/rental-history";
import { mailer } from '../helper/mailer';
import { notifyRentalHistoryCreatedToLandlord, notifyRentalHistoryCreatedToTenant, notifyRentalHistoryTerminatedToLandlord, notifyRentalHistoryTerminatedToTenant } from '../utils/mailer-templates'
import { User } from '../models/user';
import { singleRentalHistoryLookup, rentalHistoryLookup } from '../utils/queryMaker';
import { RentIntention } from '../models/rent-intention';
import { IRentIntention } from '../models/interfaces';

const RentalHistoryRouter = express.Router()

/**
 * setFilter helper function, is a function that helps set the query filter based on query key/vlue pairs
 * @function
 * @param {string} key - The search param key
 * @param {any} value - The corresponding search param value
 * @returns {any} - Query condition
 */
function setFilter(key:string, value:any) {
    switch (key) {
        case 'propertyId':
            return {'propertyId': new Types.ObjectId(value)}
        case 'landlordId':
            return {landlordId: new Types.ObjectId(value)}
        case 'tenantId':
            return {'tenantId': new Types.ObjectId(value)}
        case 'startDate':
            return {startDate: {$lte: value}}
        case 'endDate':
            return {endDate: {$lte: value}}
        case 'status':
            return {endDate: {$lte: value}}
        default:
            return {}
    }
}

/**
 * dateSetter helper function, is a function that helps set the query filter based on startDate and endDate
 * @function
 * @param {any} reqParams - The provided search query object
 * @param {string} dateQuery - The provided query key
 * @param {Array<string>} queryArray - The current collection of the query keys
 * @returns {any} - Query condition
 */
function dateSetter (reqParams: any, queryArray: string[], dateQuery: string) {
    // console.log(priceQuery, Number.parseInt(reqParams['minprice'], 10), Number.parseInt(reqParams['maxprice'], 10))
    if (dateQuery === 'startDate') {
        if (queryArray.includes('endDate')) {
            return {$and: [{'startDate': {$gte: Number(reqParams['startDate'])}}, {'endDate' : {$lte: Number(reqParams['endDate'])}}]}
        }
        return {'startDate': {$gte: Number(reqParams['startDate'])}}
    }
    else if (dateQuery === 'endDate') {
        if (queryArray.includes('startDate')) {
            return {$and: [{'startDate': {$gte: Number(reqParams['startDate'])}}, {'endDate' : {$lte: Number(reqParams['endDate'])}}]}
        }
        return {'endDate': {$lte: Number(reqParams['endDate'])}}
    }
}

// ***************************** public enpoints ***********************************************

// ***************************** Shared enpoints ***********************************************

// get rental history list
RentalHistoryRouter.get('/api/rental-histories', isLoggedIn, async (req: Request, res: Response) => {
    try {
        let filter: any = {}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'startDate' || key === 'endDate') {
                        filter = Object.assign(filter, dateSetter(req.query, queries, key))
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const rentalHistoryList = await RentalHistory.aggregate(rentalHistoryLookup(filter))
        res.send({ok: true, data: rentalHistoryList})

    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get rental history detail
RentalHistoryRouter.get('/api/rental-histories/:id/detail', isLoggedIn, async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            throw INVALID_REQUEST
        }
        const rentalHistory = await RentalHistory.aggregate(singleRentalHistoryLookup(req.params.id))
        if (!rentalHistory || rentalHistory.length === 0) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: rentalHistory[0]})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// ***************************** tenant restricted enpoints ***********************************************


// ***************************** Landlord restricted enpoints ***********************************************


// ***************************** Admin restricted enpoints ***********************************************

// create a new rental histroy
RentalHistoryRouter.post('/api/rental-histories', isLoggedIn, isAdmin, async (req: Request, res:Response) => {
    const {propertyId, landlordId, tenantId, startDate, rentIntentionId} = req.body
    let isNewIntentionCreated: boolean = false
    try {
        if (!propertyId || !landlordId || !tenantId || !startDate || !rentIntentionId) {
            throw INVALID_REQUEST
        }

        // check if there is an ongoing rental history for this tenant/landlord/property/status
        const existAlreadyAndOngoing = await RentalHistory.findOne({
            propertyId: new Types.ObjectId(propertyId.toString()),
            landlordId: new Types.ObjectId(landlordId.toString()),
            tenantId: new Types.ObjectId(tenantId.toString()),
            status: 'ONGOING'
        })
        if (existAlreadyAndOngoing) {
            throw RENTALHISTORY_CURRENTLY_ONGOING
        }

        let actualRentIntention: IRentIntention | any
        // check if a rent intention had been created and it's status is still INITIATED or UNCONCLUDED
        const relatedExistingRentIntention = await RentIntention.findOne({
            _id: new Types.ObjectId(rentIntentionId.toString()),
            $or: [
                {status: 'INITIATED'},
                {status: 'UNCONCLUDED'}
            ]
        })

        // if there is a related existing rent-intention then we will use it further down execution else create one first
        if (!relatedExistingRentIntention) {
            const newRentIntention = new RentIntention({
                propertyId: new Types.ObjectId(propertyId.toString()),
                landlordId: new Types.ObjectId(landlordId.toString()),
                potentialTenantId: new Types.ObjectId(tenantId.toString()),
                comment: ""
            })
            // updated isNewIntentionCreated
            isNewIntentionCreated = true
            // add a logger
            console.log(new Date(Date.now()), ' Creating a related RentIntention first since it doesn\'t exit')
            const addedRentIntention = await newRentIntention.save()
            actualRentIntention = addedRentIntention
        }
        else {
            actualRentIntention = relatedExistingRentIntention
        }

        // create a new rental history record and save it in the database
        const newRentalHistory = new RentalHistory({
            propertyId: new Types.ObjectId(propertyId.toString()),
            landlordId: new Types.ObjectId(landlordId.toString()),
            tenantId: new Types.ObjectId(tenantId.toString()),
            startDate: Date.parse(new Date(startDate).toString()),
            rentIntentionId: actualRentIntention._id
        })
        const rentalHistory = await newRentalHistory.save()
        if (!rentalHistory) {
            throw SAVE_OPERATION_FAILED
        }

        // update the corresponding rent-intention's status to CONCLUDED
        actualRentIntention.status = 'CONCLUDED'
        await actualRentIntention.save()

        // get the corresponsing landlord and tenant  so that we can get their fullnames to be used in the email templates
        const _landlord = await User.findById(landlordId)
        const _tenant = await User.findById(tenantId)

        // send an email to both the tenant and landlord
        const link = `${process.env.CLIENT_URL}/profile`

        // landlord
        const {subject, heading, detail, linkText} = notifyRentalHistoryCreatedToLandlord(_landlord.fullname)
        const success = await mailer(_landlord.email, subject, heading, detail, link, linkText )

        // tenant
        const {_subject, _heading, _detail, _linkText} = notifyRentalHistoryCreatedToTenant(_tenant.fullname)
        const _success = await mailer(_tenant.email, _subject, _heading, _detail, link, _linkText )

        // send the response
        res.send({ok: true})
    } catch (error) {
        // check if a rentIntention was created and delete it
        if (isNewIntentionCreated) {
            // add a logger
            console.log(new Date(Date.now()), ' Delete any related RentIntention  if created during the operation')
            await RentIntention.deleteOne({
                propertyId: new Types.ObjectId(propertyId.toString()),
                landlordId: new Types.ObjectId(landlordId.toString()),
                potentialTenantId: new Types.ObjectId(tenantId.toString()),
            })
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// terminate a rental history (by updating the status and endDate)
RentalHistoryRouter.patch('/api/rental-histories/:id/terminate', isLoggedIn, isAdmin,async (req:Request, res: Response) => {
    try {
        // get the corresponding rent-intension by id
        const rentalHistory = await RentalHistory.findById(req.params.id)
        if (!rentalHistory) {
            throw NOT_FOUND
        }
        // update and save the rentalHistory document
        rentalHistory.status = 'TERMINATED'
        rentalHistory.endDate = Date.now()
        await rentalHistory.save()

        // notify but tenant and landlord
        const _landlord = await User.findById(rentalHistory.landlordId)
        const _tenant = await User.findById(rentalHistory.tenantId)
        // send an email to both the tenant and landlord
        const landlordLink = `${process.env.CLIENT_URL}/profile`
        const tenantLink = `${process.env.CLIENT_URL}/`
        // landlord
        const {subject, heading, detail, linkText} = notifyRentalHistoryTerminatedToLandlord(_landlord.fullname)
        const success = await mailer(_landlord.email, subject, heading, detail, landlordLink, linkText )
        // tenant
        const {_subject, _heading, _detail, _linkText} = notifyRentalHistoryTerminatedToTenant(_tenant.fullname)
        const _success = await mailer(_tenant.email, _subject, _heading, _detail, tenantLink, _linkText )
        res.send({ok: true})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

export {
    RentalHistoryRouter
}