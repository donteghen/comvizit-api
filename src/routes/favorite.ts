import express, { Request, Response } from 'express'
import { Types } from 'mongoose';
import { User } from '../models/user';
import { errors } from "../constants";
import { isLoggedIn, isTenant} from '../middleware/auth-middleware';
import { Favorite } from "../models/favorite";
import { IFavorite } from '../models/interfaces';
import { logger } from '../logs/logger';

const { NOT_FOUND } = errors;
const FavoriteRouter = express.Router()

// ***************************** tenant enpoints ***********************************************


// get a tenant's favorite property list
FavoriteRouter.get('/api/fav-property-list', isLoggedIn, isTenant, async (req: Request, res: Response) => {
    try {
        let favProperties: (IFavorite | any)[] | undefined = []
        const favIdList = req.user.favorites
        if (favIdList && favIdList.length > 0){
            favProperties = await Favorite.aggregate([
                {
                    $match: {
                        _id: {$in: favIdList.map(id => new Types.ObjectId(id))}
                    }
                },

                {
                    $lookup: {
                        from: "properties",
                        localField: "propertyId",
                        foreignField : "_id" ,
                        as: "property"
                    }
                },
                {
                    $unwind: {
                        path: '$property'
                    }
                }
            ])
        }
        res.send({ok:true, data: favProperties})
    } catch (error) {
        logger.error(`An Error while querying favorite list due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})


// Add a property to tenant's favorite property list
FavoriteRouter.patch('/api/fav-property-list/add-favorite', isLoggedIn, isTenant, async (req: Request, res: Response) => {
    try {
        const propertyId: string = req.body.id
        if (!propertyId) {
            throw NOT_FOUND
        }
        const user = await User.findById(req.user.id)
        const favAlreadyExit = await Favorite.findOne({
            $and: [
                {propertyId: new Types.ObjectId(propertyId)},
                {userId: user._id}
            ]
        })
        // check if fav is already added
        if (favAlreadyExit) {
            return res.send({ok:true, message: 'Property already added to favorite list'})
        }
        // if not added yet, create a new fav document
        const newFav = new Favorite({
            propertyId: new Types.ObjectId(propertyId),
            userId: user._id
        })
        const fav = await newFav.save()
        // update user document favorite property
        let userFavList = user.favorites
        if (!userFavList.includes(fav._id.toString())) {
            userFavList = userFavList.concat(fav._id.toString())
            user.favorites = userFavList
            await user.save()
        }

        res.send({ok:true})
    } catch (error) {
        logger.error(`An Error occured while adding a favorite property to fav collection due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})

// Remove a property from tenant's favorite property list
FavoriteRouter.patch('/api/fav-property-list/remove-favorite', isLoggedIn, isTenant, async (req: Request, res: Response) => {
    try {
        const favId = req.body.id
        if (!favId) {
            throw NOT_FOUND
        }
        const fav = await Favorite.findById(favId)
        if (!fav) {
            throw NOT_FOUND
        }
        // delete the fav
        await Favorite.findByIdAndRemove(fav._id)
        // remove fav from tenant's fav list
        let userFavList = req.user.favorites
        const user = await User.findById(req.user.id)
        if (userFavList?.length > 0) {
            userFavList = userFavList.filter(id => id !== fav._id.toString())
        }
        user.favorites = userFavList
        const updatedUser = await user.save()
        res.send({ok:true, data: updatedUser})
    } catch (error) {
        logger.error(`An Error occured while removing a favorite property from fav collection due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})



// Clear tenant's favorite property list
FavoriteRouter.patch('/api/fav-property-list/clear-favorite-list', isLoggedIn, isTenant, async (req: Request, res: Response) => {
    try {
        // delete all current tenant's favorite property list
        await Favorite.deleteMany({
            userId: new Types.ObjectId(req.user.id)
        })
        // clear tenant's fav list
        const user = await User.findById(req.user.id)
        user.favorites = []
        const updatedUser = await user.save()
        res.send({ok:true, data: updatedUser})
    } catch (error) {
        logger.error(`An Error occured while clearing a fav collection due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})

export {
    FavoriteRouter
}