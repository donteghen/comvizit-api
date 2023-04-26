import express , {Request, Response} from "express";
import { Chat } from "../models/chat";
import { isAdmin, isLoggedIn } from "../middleware/auth-middleware";
import { CHAT_PARAM_INVALID, INVALID_REQUEST, NOT_FOUND } from "../constants/error";
import { logger } from "../logs/logger";
import { Types } from "mongoose";
import { setDateFilter } from "../utils/date-query-setter";

const ChatRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'receiverId':
            return { 'members': { $in: [value] } }
        case 'senderId':
            return { 'members': { $in: [value] } }
        default:
            return {}
    }
}

// create a chat
ChatRouter.post('/chats', isLoggedIn, async (req: Request, res:Response) => {
    try {
        if (!req.body.senderId || !req.body.receiverId) {
            throw CHAT_PARAM_INVALID
        }
        const newChat = new Chat({
            members: [req.body.senderId, req.body.receiverId]
        });
        const result = await newChat.save();
        res.send({ok: true, data: result});
    } catch (error) {
        logger.error(`An error occured while creating a chat due to : ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
  })

// get all chat by a user
ChatRouter.get('/chats', isLoggedIn, async (req: Request, res:Response) => {
    try {
        const userChats = await Chat.find({
            members: { $in: [req.user.id] },
        }).sort({createdAt: -1}) ;
        res.send({ok: true, data: userChats})
    } catch (error) {
        logger.error(`An error occured while getting the chat list for the user with id: ${req.user.id} due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})


// get a single chat
ChatRouter.get('/chats/id', isLoggedIn, async (req: Request, res:Response) => {
    try {
        if (!req.params.id) {
            throw INVALID_REQUEST;
        }
        const chat = await Chat.findOne({
            _id: new Types.ObjectId(req.params.id),
            members: { $in: [req.user.id] },
        });
        if (!chat) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: chat})
    } catch (error) {
        logger.error(`An error occured while getting the chat detail for the chat with id: ${req.params.id} due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

/************************* Admin Restricted Endpoints *************************/

// get all chats
ChatRouter.get('/all-chats', isLoggedIn, isAdmin, async (req: Request, res:Response) => {
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
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})