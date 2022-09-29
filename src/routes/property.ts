import { Property } from "../models/property";
import express, { Request, Response } from 'express'
import adminAuth from "../middleware";

const PropertyRouter = express.Router()

const pageSize: number = 24 // number of documents returned per request for the get all properties route

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'ownerId':
            return {'ownerId': value.toString()}
        case 'ownerId':
            return {'ownerId': { "$regex": value, $options: 'i'}}
        case 'maxprice':
            return {'price': {$lte : Number.parseInt(value, 10)}}
        case 'minprice':
            return {'price': {$gte : Number.parseInt(value, 10)}}
        case 'bedroomCount':
            return {'bedroomCount': value}
        case 'propertyType':
            return {'propertyType': value}
        case 'propertSize':
            return {'propertSize': {$gte : Number.parseInt(value, 10)}}
        case 'distanceFromRoad':
            return {'distanceFromRoad': {$lte : Number.parseInt(value, 10)}}
        case 'costFromRoad':
            return {'costFromRoad': {$lte : Number.parseInt(value, 10)}}
        case 'furnishedState':
            return {'furnishedState': value}
        case 'amenities':
            return {'amenities': {$in : value}}
        case 'facilities':
            return {'facilities': {$in : value}}
        case 'amenities':
            return {'amenities': {$in : value}}
        case 'preferedTenant':
            return {'preferedTenant': value}
        default:
            return {}
    }
}

function setSorter (key:string, value:any) {
    switch (key) {
        case 'HighToLow':
            return {'price': -1}
        case 'LowToHigh':
            return {'price': 1}
        case 'MostRecent':
            return {'updated': -1}
        default:
            return {}
    }
}

// ***************************** public enpoints ***********************************************

// get all properties
PropertyRouter.get('/api/properties', async (req: Request, res: Response) => {
    try {
        let filter: any = {}
        let sorting:any = {}
        let pageNum: number = 1
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'sorting') {
                        sorting = Object.assign(sorting, setSorter(key, req.query[key]))
                    }
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key] as string, 10)
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const properties = await Property.aggregate([
            {
                $match: filter
            },
            {
                $sort: sorting
            },
            {
                $skip: (pageNum - 1) * pageSize
            },
            {
                $limit: pageNum
            }

        ])
        const resultCount = await Property.countDocuments(filter)
        const totalPages = Math.floor(resultCount / pageSize)

        res.send({ok: true, data: {properties, currPage: pageNum, totalPages}})
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

// get properties in same quater
PropertyRouter.get('/api/property/related-properties', async (req: Request, res: Response) => {
    try {
        const relatedProperties = await Property.find({quater: req.body.quater}).limit(4)

        res.send({ok:true, data: relatedProperties})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// create new property
PropertyRouter.patch('/api/properties', adminAuth, async (req: Request, res: Response) => {
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
        const updatedProperty = await Property.findByIdAndUpdate(req.params.id, {$set: update})
        if (!updatedProperty) {
            throw new Error('Update requested failed!')
        }

        res.status(201).send({ok: true, data: updatedProperty})
    } catch (error) {
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