import express , {Request, Response} from "express";
import { Chat } from "../models/chat";
import { isAdmin, isLoggedIn } from "../middleware/auth-middleware";
import { CHAT_PARAM_INVALID, INVALID_REQUEST, NOT_FOUND } from "../constants/error";
import { logger } from "../logs/logger";
import { PipelineStage, Types } from "mongoose";
import { setDateFilter } from "../utils/date-query-setter";
import { constants } from "../constants/declared";
import { User } from "../models/user";

const ChatRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'tenant':
            return { tenant:  value}
        case 'landlord':
            return { landlord:  value}
        default:
            return {}
    }
}

// create a chat
ChatRouter.post('/api/chats', isLoggedIn, async (req: Request, res:Response) => {
    try {
        if (!req.body.tenant || !req.body.landlord) {
            throw CHAT_PARAM_INVALID
        }
        // check if chat already exists between the tenant and landlord
        const existingChat = await Chat.findOne({
            tenant: req.body.tenant,
            landlord: req.body.landlord
        });
        if (existingChat) {
            return res.send({ok: true, data: existingChat});
        }
        const newChat = new Chat({
            tenant: req.body.tenant,
            landlord: req.body.landlord
        });
        const result = await newChat.save();
        res.send({ok: true, data: result});
    } catch (error) {
        logger.error(`An error occured while creating a chat due to : ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error})
    }
  })

// get all chat by a user
ChatRouter.get('/api/chats', isLoggedIn, async (req: Request, res:Response) => {
    try {
        let pipeline : [PipelineStage] | any
        if (req.user.role === constants.USER_ROLE.TENANT) {
            pipeline = [
                {
                    $match: {
                        tenant: req.user.id
                    }
                },
                {
                    $addFields: {
                        landlordId: { $toObjectId: "$landlord" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'landlordId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                    }
                }
            ]
        }
        else {
            pipeline = [
                {
                    $match: {
                        landlord: req.user.id
                    }
                },
                {
                    $addFields: {
                        tenantId: { $toObjectId: "$tenant" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'tenantId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                    }
                }
            ]
        }

        let userChats: any[]  = await Chat.aggregate(pipeline).sort({createdAt: -1}) ;
        res.send({ok: true, data: userChats})
    } catch (error) {
        console.log(error)
        logger.error(`An error occured while getting the chat list for the user with id: ${req.user.id} due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})


// get a single chat
ChatRouter.get('/api/chats/id', isLoggedIn, async (req: Request, res:Response) => {
    try {
        if (!req.params.id) {
            throw INVALID_REQUEST;
        }
        // check if the user is an admin and if yes then query only by id, else make sure the user is a member of that chat
        const chat = req.user.role === constants.USER_ROLE.ADMIN ?
        await Chat.findOne({_id: new Types.ObjectId(req.params.id)})
        :
        req.user.role === constants.USER_ROLE.TENANT ?
        await Chat.findOne({ _id: new Types.ObjectId(req.params.id), tenant: req.user.id})
        :
        await Chat.findOne({ _id: new Types.ObjectId(req.params.id), landlord: req.user.id});
        if (!chat) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: chat})
    } catch (error) {
        logger.error(`An error occured while getting the chat detail for the chat with id: ${req.params.id} due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})

/************************* Admin Restricted Endpoints *************************/

// get all chats by admin
ChatRouter.get('/api/all-chats', isLoggedIn, isAdmin, async (req: Request, res:Response) => {
    try {
        let filter: any = {}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                let dateFilter = setDateFilter(req.query['startDate']?.toString()??'', req.query['endDate']?.toString()??'')
                filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) :  filter
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const chats = await Chat.find(filter).sort({createdAt: -1}) ;;
        res.send({ok: true, data: chats})
    } catch (error) {
        logger.error(`An error occured while getting a chat list due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})

export {
    ChatRouter
}