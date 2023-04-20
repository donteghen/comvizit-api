import express, { Request, Response } from 'express'
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import {DELETE_OPERATION_FAILED, INVALID_REQUEST, NOT_FOUND, REVIEW_ALREADY_EXIST, SAVE_OPERATION_FAILED} from '../constants/error'
import {Types} from 'mongoose';
import { Review } from '../models/review';
import {constants} from '../constants/declared'
import { logger } from '../logs/logger';
import { setDateFilter } from '../utils/date-query-setter';

const ReviewRouter = express.Router()

/**
 * Get review search query filter
 * @Method Review
 * @param {string} key
 * @returns {any} any
 */
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'type':
            return {'type': value}
        case 'rating':
            return {'rating': value}
        case 'status':
            return {'status': value}
        case 'author':
            return {'author': value}
        case 'authorType':
            return {'authorType': value}
        case 'refId':
            return {'refId': value}
        default:
            return {}
    }
}

// ***************************** public enpoints ***********************************************

// create a new review
ReviewRouter.post('/api/reviews/create', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const {type, rating, comment, refId, status} = req.body
        const author = new Types.ObjectId(req.user.id)
        const authorType = req.user.role
        const existAlready = await Review.findOne({$and: [{type}, {author}, {refId}]})
        if (existAlready) {
            throw REVIEW_ALREADY_EXIST
        }
        const newReview = new Review({
            type, rating, comment, status, author, refId, authorType
        })
        const review = await newReview.save()
        if (!review) {
            throw SAVE_OPERATION_FAILED
        }

        res.send({ok: true, data: review})
    } catch (error) {
        logger.error(`An Error occured while creating a new review of type: ${req.body.type} by the user with id: ${req.user.id} due to ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// fetch reviews and respond with the calculated average rating
ReviewRouter.post('/api/reviews-rating-count', async (req: Request, res: Response) => {
    try {
        let averageRating: number = 0
        if (!req.body.refId || !req.body.type) {
            throw INVALID_REQUEST
        }
        const reviews = await Review.find({
            type: req.body.type,
            refId: req.body.refId.trim(),
            status: constants.REVIEW_STATUS.ACTIVE
        },
        {rating: 1})
        if (reviews?.length > 0) {
            const total: number = reviews.map(review => Number(review.rating)).reduce((prev:number, sum: number) => prev + sum, 0)
            averageRating = Number((total / reviews?.length).toFixed(1))
        }

        res.send({ok: true, data: {averageRating}, reviews})
    } catch (error) {
        logger.error(`An Error occured while fetching  review count for the review of type: ${req.body.type}  with refId: ${req.body.refId} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get all reviews (with or without query string)
ReviewRouter.get('/api/reviews', async (req: Request, res: Response) => {
    try {
        let filter: any = {}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            let dateFilter = setDateFilter(req.query['startDate']?.toString()??'', req.query['endDate']?.toString()??'')
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) :  filter
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const reviews = await Review.find(filter).sort({createdAt: -1}).populate('author', ['fullname', 'avatar', 'address.town'] ).exec()
        res.send({ok: true, data: reviews})
    } catch (error) {
        logger.error(`An Error occured while querying all reviews due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get a single review by id
ReviewRouter.get('/api/reviews/:id',  async (req: Request, res: Response) => {
    try {
        const review = await Review.findById(req.params.id).populate('author', ['fullname', 'avatar', 'address.town'] ).exec()
        if (!review) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: review})
    } catch (error) {
        logger.error(`An Error occured while querying the details of the review with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})


// ***************************** admin enpoints ***********************************************


// update review's status
ReviewRouter.patch('/api/reviews/:id/status-update', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        if (req.body.status) {
            const review = await Review.findById(req.params.id)
            if (!review) {
                throw NOT_FOUND
            }
            review.status = req.body.status
            const updatedReview = await review.save()
            if (!updatedReview) {
                throw SAVE_OPERATION_FAILED
            }
            res.send({ok: true, data: updatedReview})
        }
        else {
            throw INVALID_REQUEST
        }
    } catch (error) {
        logger.error(`An Error occured while update the status of the review with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

// delete a review by id
ReviewRouter.delete('/api/reviews/:id/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id)
        if (!review) {
            throw DELETE_OPERATION_FAILED
        }
        res.send({ok: true})
    } catch (error) {
        logger.error(`An Error occured while deleting the review with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

export {
    ReviewRouter
}