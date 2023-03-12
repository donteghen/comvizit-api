import express, { Request, Response } from 'express'
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import {Log} from '../models/log'
import {DELETE_OPERATION_FAILED, INVALID_REQUEST, NOT_FOUND, SAVE_OPERATION_FAILED, TAG_ALREADY_EXISTS} from '../constants/error'
import mongoose, {Types} from 'mongoose';
import { logger } from '../logs/logger';

const LogRouter = express.Router()
/**
 * Get tag search query filter
 * @Method Tag
 * @param {string} key
 * @returns {any} any
 */
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'level':
            return {'level': value}
        case '_id':
            return {'_id': new Types.ObjectId(value)}
        default:
            return {}
    }
}




// get all logs (with or without query string)
LogRouter.get('/api/logs', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
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
        const logs = await Log.find(filter)
        res.send({ok: true, data: logs})
    } catch (error) {
        logger.error(`An Error occured while querying log list due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get a single log by id
LogRouter.get('/api/logs/:id',  async (req: Request, res: Response) => {
    try {
        const log = await Log.findById(req.params.id)
        if (!log) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: log})
    } catch (error) {
        logger.error(`An Error occured while querying the details of the log with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})


// delete a single log record by id
LogRouter.delete('/api/logs/:id/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const log = await Log.findByIdAndDelete(req.params.id)
        if (!log) {
            throw DELETE_OPERATION_FAILED
        }
        res.send({ok: true})
    } catch (error) {
        logger.error(`An Error occured while deleting the log with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

// delete all
// LogRouter.delete('/delete-logs', () => {
//     try {
//         (function () {
//             Log.deleteMany().then(() => console.log('deleted all log records'))
//         })()
//     } catch (error) {
//         console.log(error)
//     }
// })

export {
    LogRouter
}