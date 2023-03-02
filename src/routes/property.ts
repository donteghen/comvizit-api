import { Property } from "../models/property";
import express, { Request, Response } from 'express'

import { Types, PipelineStage } from "mongoose";
import { categoryAggregator, townAggregator } from "../utils/queryMaker";
import { isAdmin, isLandlord, isLoggedIn, isTenant } from "../middleware/auth-middleware";
import { DELETE_OPERATION_FAILED, NOT_AUTHORIZED, NOT_FOUND, NOT_PROPERTY_OWNER, SAVE_OPERATION_FAILED, TAG_ALREADY_EXISTS} from '../constants/error'
import {notifyPropertyAvailability} from '../utils/mailer-templates'
import { mailer } from "../helper/mailer";
import { IUser } from "../models/interfaces";
import { User } from "../models/user";
import { Tag } from "../models/tag";
import { FeaturedProperties } from "../models/featured-properties";
import { Complain } from "../models/complain";
import { Review } from "../models/review";
import { Like } from "../models/like";


const PropertyRouter = express.Router()

const pageSize: number = 24 // number of documents returned per request for the get all properties route


// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'ownerId':
            return {'ownerId': new Types.ObjectId(value)}
        case 'age':
            return {'age': {$lte: Number(value)}}
        case 'availability':
            return {'availability': value}
        case 'bedroomCount':
            return {'bedroom': value.toString()}
        case 'propertyType':
            return {'propertyType': value}
        case 'propertySize':
            return {'propertySize': {$gte : Number.parseInt(value, 10)}}
        case 'distanceFromRoad':
            return {'distanceFromRoad': {$lte : Number.parseInt(value, 10)}}
        case 'costFromRoad':
            return {'costFromRoad': {$lte : Number.parseInt(value, 10)}}
        case 'furnishedState':
            return {'furnishedState': value}
        case 'amenities':
            return {'amenities': {$all : value}}
        case 'facilities':
            return {'facilities': {$in : [value]}}
        case 'features':
            return {'features': {$in : [value]}}
        case 'town':
            return {'town': { "$regex": value, $options: 'i'}}
        case 'district':
            return {'district.name': { "$regex": value, $options: 'i'}}
        case 'quater':
            return {'quater.name': { "$regex": value, $options: 'i'}}
        case 'districtref':
            return {'district.ref': value}
        case 'quaterref':
            return {'quater.ref': value}
        default:
            return {}
    }
}

function setSorter (value:any) {
    switch (value) {
        case 'HighToLow':
            return {price: -1}
        case 'LowToHigh':
            return {price: 1}
        case 'MostRecent':
            return {updated: -1}
        default:
            return {updated: -1}
    }
}

function priceSetter (reqParams: any, queryArray: string[], priceQuery: string) {
    // console.log(priceQuery, Number.parseInt(reqParams['minprice'], 10), Number.parseInt(reqParams['maxprice'], 10))
    if (priceQuery === 'minprice') {
        if (queryArray.includes('maxprice')) {
            return {$and: [{'price': {$gte: Number.parseInt(reqParams['minprice'], 10)}}, {'price' : {$lte: Number.parseInt(reqParams['maxprice'], 10)}}]}
        }
        return {'price': {$gte: Number.parseInt(reqParams['minprice'], 10)}}
    }
    else if (priceQuery === 'maxprice') {
        if (queryArray.includes('minprice')) {
            return {$and: [{'price': {$gte: Number.parseInt(reqParams['minprice'], 10)}}, {'price' : {$lte: Number.parseInt(reqParams['maxprice'], 10)}}]}
        }
        return {'price': {$lte: Number.parseInt(reqParams['maxprice'], 10)}}
    }
}

// ***************************** public enpoints ***********************************************

// get all properties in quater
PropertyRouter.get('/api/properties-in-quater/:quaterref', async (req: Request, res: Response) => {
    try {
        let filter: any = {availability:'Available'}
        let sorting:any = {updated: -1}
        let pageNum: number = 1
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'maxprice' || key === 'minprice') {
                        filter = Object.assign(filter, priceSetter(req.query, queries, key))
                    }
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key] as string, 10)
                    }
                    if (key === 'sorting') {
                        sorting = setSorter(req.query[key])
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const mainfilter = {$and: [{'quater.ref':req.params.quaterref}, filter]}
        // console.log(filter['age'])
        const properties = await Property.aggregate([
            {
                $match: mainfilter
            },
            {
                $sort: sorting
            },
            {
                $skip: (pageNum - 1) * pageSize
            },
            {
                $limit: pageSize
            }

        ])

        const resultCount = await Property.countDocuments(mainfilter)
        const totalPages = Math.ceil(resultCount / pageSize)

        res.send({ok: true, data: {properties, currPage: pageNum, totalPages, resultCount}})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get all properties
PropertyRouter.get('/api/properties', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
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
        // console.log(req.query, filter)
        const properties = await Property.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "users",
                    localField: "ownerId",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: "$owner"
            }
        ])

        res.send({ok: true, data: properties})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get all landlords properties
PropertyRouter.get('/api/landlord-properties', isLoggedIn, isLandlord, async (req: Request, res: Response) => {

    try {

        let filter: any = {ownerId: new Types.ObjectId(req.user.id)}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const properties = await Property.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "users",
                    localField: "ownerId",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: "$owner"
            }
        ])
        res.send({ok: true, data: properties})
    } catch (error) {
        console.log(error)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// search using quaterref index for property's quater.ref and return various category counts
PropertyRouter.get('/api/search-property-categories/:quaterRef', async (req: Request, res: Response) => {
    try {
        const catAggregator = categoryAggregator(req.params.quaterRef)
        const quaters = await Property.aggregate(catAggregator)
        res.send({ok: true, data: quaters})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})


// search with autocomplete index for quater and return matching quater name & ref
PropertyRouter.get('/api/search-quaters/:quaterRef', async (req: Request, res: Response) => {

    try {
        const quaters = await Property.aggregate([

            {
                $search:{
                    index: 'autocomplete',
                    autocomplete: {
                        query: req.params.quaterRef,
                        path: 'quater.ref'
                    }
                }
            },
            {
                $match: {
                    "availability": "Available"
                }
            },
            {
                $project:{
                    "quater": 1,
                }
            },
            {$group: {_id : '$quater.ref'}},
            {$limit: 10}
        ])
        res.send({ok: true, data: quaters})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get properties in a town
PropertyRouter.get('/api/town-properties/:town', async (req: Request, res: Response) => {
    try {
        let filter: any = {availability:'Available'}
        let sorting:any = {createdAt: -1}
        let pageNum: number = 1
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key] as string, 10)
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const mainfilter = {$and: [{town: { "$regex": req.params.town, $options: 'i'}}, filter]}
        // console.log(mainfilter)
        const properties = await Property.aggregate([
            {
                $match: mainfilter
            },
            {
                $sort: sorting
            },
            {
                $skip: (pageNum - 1) * pageSize
            },
            {
                $limit: pageSize
            }

        ])

        const resultCount = await Property.countDocuments(mainfilter)
        const totalPages = Math.ceil(resultCount / pageSize)

        res.send({ok: true, data: {properties, currPage: pageNum, totalPages, resultCount}})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get properties in a district
PropertyRouter.get('/api/district-properties/:districtref', async (req: Request, res: Response) => {
    try {
        let filter: any = {availability:'Available'}
        let sorting:any = {createdAt: -1}
        let pageNum: number = 1
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key] as string, 10)
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const mainfilter = {$and: [{'district.ref': req.params.districtref}, filter]}
        // console.log(mainfilter)
        const properties = await Property.aggregate([
            {
                $match: mainfilter
            },
            {
                $sort: sorting
            },
            {
                $skip: (pageNum - 1) * pageSize
            },
            {
                $limit: pageSize
            }

        ])

        const resultCount = await Property.countDocuments(mainfilter)
        const totalPages = Math.ceil(resultCount / pageSize)

        res.send({ok: true, data: {properties, currPage: pageNum, totalPages, resultCount}})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get properties groups by town and their count
PropertyRouter.get('/api/properties-group-by-town', async (req: Request, res: Response) => {
    try {
        const groupsByTown = await Property.aggregate([
            {
                $group: {
                    _id: '$town',
                    count: {$count: {}}
                }
            }
        ])
        res.send({ok: true, data: groupsByTown})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

/**
 * get properties in a town and group them by district ref and their count
 */
PropertyRouter.get('/api/properties-group-by-district', async (req: Request, res: Response) => {
    try {
        const pipeline: PipelineStage[] = [
            {
                $group: {
                    _id: '$district.ref',
                    count: {$count: {}}
                }
            }
        ]
        if (req.query.town) {
            pipeline.unshift({
                $match: {
                    town: req.query.town?.toString()
                }
            })
        }

        const groupsByDistrictRef = await Property.aggregate(pipeline)
        res.send({ok: true, data: groupsByDistrictRef})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get property count for popular towns
PropertyRouter.get('/api/count-properties-per-town', async (req: Request, res: Response) => {
    try {
        const towncountlist = await Property.aggregate(townAggregator())
        res.send({ok: true, data: towncountlist})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get single properties by id
PropertyRouter.get('/api/properties/:id', async (req: Request, res: Response) => {
    try {
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    _id: new Types.ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'ownerId',
                    foreignField: '_id',
                    as : "owner"
                }
            },
            {
                $lookup: {
                    from: 'tags',
                    localField: '_id',
                    foreignField: 'refId',
                    as : "tags"
                }
            }
        ]
        const properties = await Property.aggregate(pipeline)
        if (!properties[0]) {
            throw NOT_FOUND
        }
        res.send({ok:true, data: properties[0]})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get properties in same quater (Related prperties in same quater)
PropertyRouter.get('/api/property/:propertyId/related-properties/:quaterref', async (req: Request, res: Response) => {
    try {
        const relatedProperties = await Property.find({
            $and: [
                {availability:'Available'},
                {'quater.ref': req.params.quaterref},
                {_id : {$ne : req.params.propertyId}}
            ]})
            .limit(4)
        res.send({ok:true, data: relatedProperties})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// ***************************** Tenant Only endpoints ***********************************************






// ***************************** admin endpoints ***********************************************



// create new property
PropertyRouter.post('/api/properties', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const newProperty = new Property({
            ...req.body,
            ownerId: new Types.ObjectId(req.body.ownerId)
        })
        const property = await newProperty.save()
        res.status(201).send({ok: true, data: property})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// update property availability status
PropertyRouter.patch('/api/properties/:id/availability/update', isLoggedIn, async (req: Request, res: Response) => {
    try {
        let propertyOwner: IUser | any | undefined

        // check if user is landlord or admin and property belongs to that user(landlord)
        if (req.user.role !== 'ADMIN' && req.user.role !== 'LANDLORD') {
            throw NOT_AUTHORIZED
        }
        const property = await Property.findById(req.params.id)
        if (!property) {
            throw NOT_FOUND
        }
        if (req.user.role === 'LANDLORD') {
            if (property.ownerId.toString() !== req.user.id) {
                throw NOT_PROPERTY_OWNER
            }
            propertyOwner = req.user
        }
        if (req.user.role === 'ADMIN') {
            propertyOwner = await User.findById(property.ownerId)
        }
        // update property availability
        property.availability = req.body.availability
        property.updated = Date.now()
        const updatedProperty = await property.save()
        if (!updatedProperty) {
            throw SAVE_OPERATION_FAILED
        }
        // notify the property owner
        const {subject, heading, detail, linkText} = notifyPropertyAvailability(req.user.email, property._id.toString(), req.body.availability)
        const link = `${process.env.CLIENT_URL}/${propertyOwner.role === 'ADMIN' ? 'dashboard' : 'profile'}`
        const success = await mailer(propertyOwner.email, subject, heading, detail, link, linkText )

        res.status(200).send({ok: true})
    } catch (error) {
        console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})


// update property
PropertyRouter.patch('/api/properties/:id/update', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const update: any = {}
        Object.keys(req.body).forEach(key => {
            update[key] = req.body[key]
        })
        if (Object.keys(update).length > 0) {
            update.updated = Date.now()
        }
        const updatedProperty = await Property.findByIdAndUpdate(req.params.id, {$set: update}, {runValidators:true})

        if (!updatedProperty) {
            throw SAVE_OPERATION_FAILED
        }

        res.status(200).send({ok: true})
    } catch (error) {
        console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// update property media
PropertyRouter.patch('/api/properties/:id/update-media',  isLoggedIn, isAdmin,  async (req: Request, res: Response) => {
    try {
        const {photos, videos, virtualTours} = req.body.media
        const property = await Property.findById(req.params.id)
        if (!property) {
            throw NOT_FOUND
        }

        property.media.photos = photos ? photos : property.media.photos
        property.media.videos = videos ? videos : property.media.videos
        property.media.virtualTours = virtualTours ? virtualTours : property.media.virtualTours
        const updatedProperty = await property.save()

        res.status(200).send({ok: true, data: updatedProperty})
    } catch (error) {
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})





// delete property
PropertyRouter.delete('/api/properties/:id/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const deletedproperty = await Property.findByIdAndDelete(req.params.id)
        if (!deletedproperty) {
            throw DELETE_OPERATION_FAILED
        }
        // delete all corresponding tags
        await Tag.deleteMany({refId: deletedproperty._id})
        // delete the related featuring if any
        const relatedFeaturing = await FeaturedProperties.findById(deletedproperty._id)
        if (relatedFeaturing) {
            await FeaturedProperties.findByIdAndDelete(relatedFeaturing._id)
        }
        // delete related reviews
        await Review.deleteMany({
            $and: [
                {type: 'Property'},
                {refId: deletedproperty._id.toString()}
            ]
        })
        // delete related complains
        await Complain.deleteMany({
            $and: [
                {type: 'PROPERTY'},
                {targetId: deletedproperty._id}
            ]
        })
        // delete related likes
        await Like.deleteMany({
            _id: {
                $in: deletedproperty.likes?.map(id => new Types.ObjectId(id))
            }
        })
        // delete rentIntensions
        // coming up
        res.status(201).send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

export {
    PropertyRouter
}