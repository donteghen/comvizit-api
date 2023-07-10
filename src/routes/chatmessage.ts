import express, {Request, Response} from 'express';
import { ChatMessage } from "../models/chatmessage";
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { CHAT_MESSAGE_PARAM_INVALID, INVALID_REQUEST } from '../constants/error';
import { logger } from '../logs/logger';
import { setDateFilter } from '../utils/date-query-setter';
import { Types, PipelineStage } from 'mongoose';

const ChatMessageRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'chatId':
            return { 'chatId': value}
        case 'senderId':
            return { 'senderId': value}
        default:
            return {}
    }
}

// add a message
ChatMessageRouter.post('/api/chat-messages', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const { chatId, senderId, content } = req.body;
        if (!chatId || !senderId || !content) {
            throw CHAT_MESSAGE_PARAM_INVALID
        }
        const newChatMessage = new ChatMessage({
            chatId,
            senderId,
            content,
        });
        const chatMessage = await newChatMessage.save()
        res.send({ok: true, data: chatMessage})
    } catch (error) {
        logger.error(`An error occured while adding a chatMesage due to : ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error})
    }
})


// get all chat messages
ChatMessageRouter.get('/api/chat-messages', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const pageSize = process.env.CHAT_MESSAGE_PAGE_SIZE ? Number(process.env.CHAT_MESSAGE_PAGE_SIZE) : 10 ;
        const chatId : string = req.query.chatId as string ;
        const page : number = req.query.page ? Number(req.query.page) : 1 ;

        if (!chatId) {
            return res.send({ok: true, data: []});
        }

        let pipeline: PipelineStage[] = [
            {
                $match: {
                    chatId
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip:  (Number(page) - 1) * pageSize
            },
            {
                $limit: pageSize
            }
        ];

        const chatMessages = await ChatMessage.aggregate(pipeline) ;
        const totalChatMessageCount = await ChatMessage.countDocuments({chatId}) ;
        const totalPages = Math.ceil(totalChatMessageCount / pageSize) ;
        const hasMore = page < totalPages ? true : false ;

        res.send({ok: true, data: {messages: chatMessages, hasMore, page}}) ;
    } catch (error) {
        logger.error(`An error occured while getting the chatmessages for chat id: ${req.body.chatId} due to ${error?.message??'Unknown Source'}`) ;
        res.status(400).send({ok:false, error}) ;
    }
})
/**************************************** Admin Restricted Endpoints */

// get all messages in the admin
ChatMessageRouter.get('/api/all-chat-messages', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
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
        const chatMessages = await ChatMessage.find(filter).sort({createdAt: -1}) ;
        res.send({ok: true, data: chatMessages})
    } catch (error) {
        logger.error(`An error occured while getting the chatmessages in the admin due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})

export {
    ChatMessageRouter
}