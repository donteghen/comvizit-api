import express, { Request, Response } from 'express'
import { isLoggedIn } from '../middleware';
import { FeaturedProperties } from "../models/featured-properties";

const FeaturedRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'propertyId':
            return {'propertyId': value}
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
        let filter: any = {}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const featuredProperties = await FeaturedProperties.find(filter)
        res.send({ok: true, data: featuredProperties})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// get a singlefeatured property by Id
FeaturedRouter.get('/api/featured/properties/:propertyId',  async (req: Request, res: Response) => {
    try {        
        const featuredProperty= await FeaturedProperties.findById(req.params.propertyId)
        if (!featuredProperty) {
            throw new Error('Featured Property Not Found!')
        }
        res.send({ok: true, data: featuredProperty})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// create new featured property
FeaturedRouter.post('/api/featured/properties/create', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const {propertyId, duration, startedAt, status} = req.body
        const newFeaturedProperty = new FeaturedProperties({
            propertyId, 
            duration, 
            startedAt, 
            status
        })
        const featuredProperty = await newFeaturedProperty.save()

        res.send({ok: true, data: featuredProperty})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message})
    }
})

// update featured property's status
FeaturedRouter.patch('/api/featured/properties/:propertyId/status/update', isLoggedIn, async (req: Request, res: Response) => {
    try {
        if (req.body.status) {
            const featuredProperty = await FeaturedProperties.findById(req.params.id)
            if (!featuredProperty) {
                throw new Error('Featured Property Not Found!')
            }
            featuredProperty.status = req.body.status 
            const updateFeaturedProperty = await featuredProperty.save()
            res.send({ok: true, data: updateFeaturedProperty})
        }
        else {
            throw new Error('Please Provide a featured property status for update!')
        }
    } catch (error) {
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error:error?.message})
    }
})

// delete a featured property by id
FeaturedRouter.delete('/api/featured/properties/:propertyId/delete', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const featuredProperty = await FeaturedProperties.findByIdAndDelete(req.params.id)
        if (!featuredProperty) {
            throw new Error('Featured Property Not Found!')
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})