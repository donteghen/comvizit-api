import express, { Request, Response } from 'express'
import { DELETE_OPERATION_FAILED, INVALID_PROPERTY_ID_FOR_FEATURING, INVALID_REQUEST, NOT_FOUND, PROPERTY_IS_ALREADY_FEATURED, PROPERTY_UNAVAILABLE_FOR_FEATURING } from '../constants/error';
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { FeaturedProperties } from "../models/featured-properties";
import {PipelineStage, Types} from 'mongoose'
import { Property } from '../models/property';
const FeaturedRouter = express.Router()

/**
 * Get featured properties search query filter
 * @Method Tag
 * @param {string} key
 * @param {any} value
 * @returns {any} any
 */
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'propertyId':
            return {'propertyId': new Types.ObjectId(value)}
        case 'status':
            return {'status': value}
        default:
            return {}
    }
}

// ***************************** public enpoints ***********************************************

// get all featured properties (with or without query string)
FeaturedRouter.get('/api/featured/properties',  async (req: Request, res: Response) => {
    try {
        let matchFilter: any = {}
        const pipeline: PipelineStage[] = [{$sort: {createAt: -1}}]
        let subpipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "property"
                }
            },
            {
                $unwind: {
                    path: "$property"
                }
            },

        ]

        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {

                if (key === 'quaterref' && req.query[key] !== undefined && req.query[key] !== null) {
                    subpipeline.push(
                        {
                            $match: {
                                "property.quater.ref": req.query[key]
                            }
                        }
                    )
                }
                if (req.query[key]) {
                    matchFilter = Object.assign(matchFilter, setFilter(key, req.query[key]))
                }
            })
        }
        if (Object.keys(matchFilter).length > 0) {
            pipeline.push({$match: matchFilter})
        }
        if (subpipeline) {
            pipeline.push(...subpipeline)
        }

        // console.log(pipeline)
        const featuredProperties = await FeaturedProperties.aggregate(pipeline)
        res.send({ok: true, data: featuredProperties})

    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get a singlefeatured property by Id
FeaturedRouter.get('/api/featured/properties/:propertyId',  async (req: Request, res: Response) => {
    try {
        const featuredProperty= await FeaturedProperties.findById(req.params.propertyId)
        if (!featuredProperty) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: featuredProperty})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// create new featured property
FeaturedRouter.post('/api/featured/properties/create', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const {propertyId, duration} = req.body
        const relatedProperty = await Property.findById(propertyId)
        if (!relatedProperty) {
            throw INVALID_PROPERTY_ID_FOR_FEATURING
        }
        if (relatedProperty.availability === 'Taken' || relatedProperty.availability === 'Inactive') {
            throw PROPERTY_UNAVAILABLE_FOR_FEATURING
        }
        const AlreadyFeatured = await FeaturedProperties.findOne({propertyId})
        if (AlreadyFeatured) {
            throw PROPERTY_IS_ALREADY_FEATURED
        }
        const newFeaturedProperty = new FeaturedProperties({
            propertyId,
            duration : Number(duration)
        })
        const featuredProperty = await newFeaturedProperty.save()

        res.send({ok: true, data: featuredProperty})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// update featured property's status
FeaturedRouter.patch('/api/featured/properties/:propertyId/status/update', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        if (req.body.status) {
            const featuredProperty = await FeaturedProperties.findById(req.params.propertyId)
            if (!featuredProperty) {
                throw NOT_FOUND
            }
            featuredProperty.status = req.body.status
            const updateFeaturedProperty = await featuredProperty.save()
            res.send({ok: true, data: updateFeaturedProperty})
        }
        else {
            throw INVALID_REQUEST
        }
    } catch (error) {
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

// delete a featured property by id
FeaturedRouter.delete('/api/featured/properties/:propertyId/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const featuredProperty = await FeaturedProperties.findByIdAndDelete(req.params.propertyId)
        if (!featuredProperty) {
            throw DELETE_OPERATION_FAILED
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

export {
    FeaturedRouter
}