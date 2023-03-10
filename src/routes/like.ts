import express, { Request, Response } from 'express'
import { Types } from 'mongoose';
import { Property } from '../models/property';
import { User } from '../models/user';
import { NOT_FOUND, SAVE_OPERATION_FAILED } from '../constants/error';
import { isAdmin, isLoggedIn, isTenant} from '../middleware/auth-middleware';
import { Like } from "../models/like";
import { logger } from '../logs/logger';


const LikeRouter = express.Router()

// query helper function
// function setFilter(key:string, value:any): any {
//     switch (key) {
//         case '_id':
//             return {'_id': value}
//         case 'propertyId':
//             return {'propertyId': new Types.ObjectId(value)}
//         case 'likeId':
//             return {'likeId': new Types.ObjectId(value)}
//         default:
//             return {}
//     }
// }

// ***************************** public enpoints ***********************************************

// get a property's like count
LikeRouter.get('/api/properties/:id/likes/count', async (req: Request, res: Response) => {
    try {
        const propertyLikeCount = await Like.countDocuments({propertyId: new Types.ObjectId(req.params.id)})
        res.send({ok: true, data: {count: propertyLikeCount}})
    } catch (error) {
        logger.error(`An Error occured while getting the likes count for the property with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})
// ***************************** tenant enpoints ***********************************************

// like a property
LikeRouter.post('/api/properties/:id/likes/increment', isLoggedIn, isTenant, async (req: Request, res: Response) => {
    try {
        // check if the tenant has already liked the property
        const isLikedAlready = await Like.findOne({
            $and: [
                {propertyId: new Types.ObjectId(req.params.id)},
                {likerId: new Types.ObjectId(req.user.id)}
            ]
        })
        // if already liked, then don't act any further.
        if (isLikedAlready) {
            return res.send({ok: true, message: 'you already liked this prop'})
        }
        // else go ahead and create the like
        const newLike = new Like({
            propertyId: new Types.ObjectId(req.params.id),
            likerId: new Types.ObjectId(req.user.id)
        })

        // save the new like then fetch and update the related property and tenant documents
        const relatedProperty = await Property.findById(req.params.id)
        const relatedTenant = await User.findById(req.user.id)
        if (!relatedProperty || !relatedTenant) {
            throw NOT_FOUND
        }
        const like = await newLike.save()
        if (!like) {
            throw SAVE_OPERATION_FAILED
        }
        if (!relatedProperty.likes.includes(like._id.toString())) {
            relatedProperty.likes = relatedProperty.likes.concat(like._id.toString())
            await relatedProperty.save()
        }
        if (!relatedTenant.likes.includes(like._id.toString())) {
            relatedTenant.likes = relatedTenant.likes.concat(like._id.toString())
            await relatedTenant.save()
        }

        res.send({ok: true})
    } catch (error) {
        logger.error(`An Error occured while liking the property with id: ${req.params.id} by user with id: ${req.user.id} due to ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})


// ***************************** admin enpoints ***********************************************

// get a property's like count
LikeRouter.get('/api/likes/count', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const likeCount = await Like.countDocuments()
        res.send({ok: true, data: {count: likeCount}})
    } catch (error) {
        logger.error(`An Error occured while getting the likes collection count by an admin due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

export {LikeRouter}