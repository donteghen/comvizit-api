import { Property } from "../models/property";
import express, { Request, Response } from 'express'
import adminAuth from "../middleware";
import { Types } from "mongoose";
import { categoryAggregator, townAggregator } from "../utils/queryMaker";

const PropertyRouter = express.Router()

const pageSize: number = 2 // number of documents returned per request for the get all properties route


// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'ownerId':
            return {'ownerId': new Types.ObjectId(value)}
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
            return {'amenities': {$in : [value]}}
        case 'facilities':
            return {'facilities': {$in : [value]}}
        case 'features':
            return {'features': {$in : [value]}}
        case 'town':
            return {'town': { "$regex": value, $options: 'i'}}
        // case 'districtref':
        //     return {'district.ref': value}
        // case 'quaterref':
        //     return {'quater.ref': value}
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

// get all properties
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
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key] as string, 10)
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        console.log(filter, sorting)
        const mainfilter = {$and: [{'quater.ref':req.params.quaterref}, filter]}
        console.log(mainfilter)
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
        res.status(400).send({ok:false, error: error.message})
    }
})

// search using quaterref index for property's quater.ref and return various category counts
PropertyRouter.get('/api/search-property-categories/:quaterRef', async (req: Request, res: Response) => {
    try {
        const catAggregator = categoryAggregator(req.params.quaterRef)
        const quaters = await Property.aggregate(catAggregator)
        res.send({ok: true, data: quaters})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
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
                $project:{
                        "quater": 1,
                }
            },
            {$limit: 10}
        ])
        res.send({ok: true, data: quaters})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})


// get property count for popular towns
PropertyRouter.get('/api/count-properties-per-town', async (req: Request, res: Response) => {
    try {
        const towncountlist = await Property.aggregate(townAggregator())
        res.send({ok: true, data: towncountlist})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// get single properties by id
PropertyRouter.get('/api/properties/:id', async (req: Request, res: Response) => {
    try {
        const property = await Property.findById(req.params.id)
        if (!property) {
            throw new Error('Property not found!')
        }
        res.send({ok:true, data: property})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// get properties in same district
PropertyRouter.get('/api/property/related-properties/:districtref', async (req: Request, res: Response) => {
    try {
        const relatedProperties = await Property.find({'district.ref': req.params.districtref}).limit(4)

        res.send({ok:true, data: relatedProperties})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// create new property
PropertyRouter.post('/api/properties', adminAuth, async (req: Request, res: Response) => {
    try {
        const newProperty = new Property({
            ...req.body
        })
        const property = await newProperty.save()
        res.status(201).send({ok: true, data: property})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message})
    }
})




// update property
PropertyRouter.patch('/api/properties/:id', adminAuth, async (req: Request, res: Response) => {
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
            throw new Error('Update requested failed!')
        }

        res.status(200).send({ok: true})
    } catch (error) {
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message})
    }
})

// delete property
PropertyRouter.delete('/api/properties/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const deletedproperty = await Property.findByIdAndDelete(req.params.id)
        if (!deletedproperty) {
            throw new Error('Property deletion failed!')
        }

        res.status(201).send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

export {
    PropertyRouter
}