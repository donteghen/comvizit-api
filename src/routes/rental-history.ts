import express, { Request, Response } from 'express'
import { Types } from 'mongoose';
import { errors, constants, messages} from '../constants';
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { RentalHistory } from "../models/rental-history";
import { User } from '../models/user';
import { RentIntention } from '../models/rent-intention';
import { IRentIntention } from '../models/interfaces';
import { logger } from '../logs/logger';

// utils & helpers
import { notifyRentalHistoryCreatedToLandlord, notifyRentalHistoryCreatedToTenant, notifyRentalHistoryTerminatedToLandlord, notifyRentalHistoryTerminatedToTenant } from '../utils/mailer-templates'
import { mailer } from '../helper/mailer';
import { setDateFilter } from '../utils/date-query-setter';
import { singleRentalHistoryQuery, rentalHistoryListQuery } from '../utils/queryMaker';


const { INVALID_REQUEST, NOT_FOUND, RENTALHISTORY_CURRENTLY_ONGOING, SAVE_OPERATION_FAILED } = errors;
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
        case 'unique_id' :
            return {unique_id: Number(value)}
        case 'status':
            return {status:  value}
        default:
            return {}
    }
}


// ***************************** public enpoints ***********************************************

// ***************************** Shared enpoints ***********************************************

// get rental history list
RentalHistoryRouter.get('/api/rental-histories', isLoggedIn, async (req: Request, res: Response) => {
    try {
        let filter: any = req.user.role === constants.USER_ROLE.TENANT ?
        {tenantId: new Types.ObjectId(req.user.id)}
        :
        req.user.role === constants.USER_ROLE.LANDLORD ?
        {landlordId: new Types.ObjectId(req.user.id)}
        :
        {}
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            let dateFilter = setDateFilter(req.query['startDate']?.toString()??'', req.query['endDate']?.toString()??'')
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) :  filter
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const pipeline = rentalHistoryListQuery(filter);
        if (queries.includes('propertyId') && req.query['propertyId']) {
            pipeline.push({
                $match: {
                    'property.unique_id': Number(req.query['propertyId'])
                }
            });
        }
        if (queries.includes('tenantId') && req.query['tenantId']) {
            pipeline.push({
                $match: {
                    'tenant.unique_id': Number(req.query['tenantId'])
                }
            });
        }
        if (req.user.role === constants.USER_ROLE.ADMIN && queries.includes('landlordId') && req.query['landlordId']) {
            pipeline.push({
                $match: {
                    'landlord.unique_id': Number(req.query['landlordId'])
                }
            });
        }
        if (queries.includes('rentIntentionId') && req.query['rentIntentionId']) {
            pipeline.push({
                $match: {
                    'rentIntention.unique_id': Number(req.query['rentIntentionId'])
                }
            });
        }
        const rentalHistoryList = await RentalHistory.aggregate(pipeline);
        res.send({ok: true, data: rentalHistoryList});

    } catch (error) {
        logger.error(`An Error occured while querying rental-history list due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})

// get rental history detail
RentalHistoryRouter.get('/api/rental-histories/:id/detail', isLoggedIn, async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            throw INVALID_REQUEST
        }
        const rentalHistory = await RentalHistory.aggregate(singleRentalHistoryQuery(req.params.id))
        if (!rentalHistory || rentalHistory.length === 0) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: rentalHistory[0]})
    } catch (error) {
        logger.error(`An Error occured while querying the details of the rental-history with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})

// ***************************** tenant restricted enpoints ***********************************************


// ***************************** Landlord restricted enpoints ***********************************************


// ***************************** Admin restricted enpoints ***********************************************

// create a new rental histroy
RentalHistoryRouter.post('/api/rental-histories', isLoggedIn, isAdmin, async (req: Request, res:Response) => {
    console.log(req.query.lang)
    const lang = req.query.lang ? req.query.lang : 'en'
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
            rentIntentionId: new Types.ObjectId(rentIntentionId.toString()),
            status: constants.RENTAL_HISTORY_STATUS_OPTIONS.ONGOING
        })
        if (existAlreadyAndOngoing) {
            throw RENTALHISTORY_CURRENTLY_ONGOING
        }

        let actualRentIntention: IRentIntention | any
        // check if a rent intention had been created and it's status is still INITIATED or UNCONCLUDED
        const relatedExistingRentIntention = await RentIntention.findOne({
            _id: new Types.ObjectId(rentIntentionId.toString()),
            status: {
                $in: [
                    constants.RENT_INTENTION_STATUS_OPTIONS.INITIATED,
                    constants.RENT_INTENTION_STATUS_OPTIONS.CONFIRMED,
                    constants.RENT_INTENTION_STATUS_OPTIONS.CONCLUDED,
                ]
            }
        })

        // if there is a related existing rent-intention then we will use it further down execution else create one first
        if (!relatedExistingRentIntention) {
            const newRentIntention = new RentIntention({
                propertyId: new Types.ObjectId(propertyId.toString()),
                landlordId: new Types.ObjectId(landlordId.toString()),
                potentialTenantId: new Types.ObjectId(tenantId.toString()),
                status: constants.RENT_INTENTION_STATUS_OPTIONS.CONCLUDED,
                comment: lang === 'fr' ? messages.AUTO_CREATE_RENT_INTENTION_COMMENT.fr : messages.AUTO_CREATE_RENT_INTENTION_COMMENT.en
            })
            // updated isNewIntentionCreated
            isNewIntentionCreated = true
            // add a logger
            logger.info('Creating a related RentIntention first since it doesn\'t exit')
            const addedRentIntention = await newRentIntention.save()
            actualRentIntention = addedRentIntention
        }
        else {
            if (relatedExistingRentIntention.status !== constants.RENT_INTENTION_STATUS_OPTIONS.CONCLUDED) {
                relatedExistingRentIntention.status = constants.RENT_INTENTION_STATUS_OPTIONS.CONCLUDED
                const updatedRelatedExistingRentIntention = await relatedExistingRentIntention.save()
                actualRentIntention = updatedRelatedExistingRentIntention
            }
            else {
                actualRentIntention = relatedExistingRentIntention
            }
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
        actualRentIntention.status = constants.RENT_INTENTION_STATUS_OPTIONS.CONCLUDED
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
        logger.error(`An Error occured while creating a new rental-history for rent-intention with id: ${req.body.rentIntentionId} due to ${error?.message??'Unknown Source'}`)
        // check if a rentIntention was created and delete it
        if (isNewIntentionCreated) {
            // add a logger
            await RentIntention.deleteOne({
                propertyId: new Types.ObjectId(propertyId.toString()),
                landlordId: new Types.ObjectId(landlordId.toString()),
                potentialTenantId: new Types.ObjectId(tenantId.toString()),
            })
            logger.info('Deleting any related RentIntention created during the rental-history creation operation before it failed')
        }
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error})
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
        rentalHistory.status = constants.RENTAL_HISTORY_STATUS_OPTIONS.TERMINATED
        rentalHistory.endDate = Date.now()
        await rentalHistory.save()

        // notify both tenant and landlord
        const _landlord = await User.findById(rentalHistory.landlordId)
        const _tenant = await User.findById(rentalHistory.tenantId)

        const landlordLink = `${process.env.CLIENT_URL}/profile`
        const tenantLink = `${process.env.CLIENT_URL}/`
        // send an email landlord
        const {subject, heading, detail, linkText} = notifyRentalHistoryTerminatedToLandlord(_landlord.fullname)
        const success = await mailer(_landlord.email, subject, heading, detail, landlordLink, linkText )
        // send an email tenant
        const {_subject, _heading, _detail, _linkText} = notifyRentalHistoryTerminatedToTenant(_tenant.fullname)
        const _success = await mailer(_tenant.email, _subject, _heading, _detail, tenantLink, _linkText )
        res.send({ok: true})
    } catch (error) {
        logger.error(`An Error occured while terminating the rental-history with id: ${req.body.rentIntentionId} due to ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error})
    }
})

export {
    RentalHistoryRouter
}