import express, { Request, Response } from 'express'
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import {Log} from '../models/log'
import {errors} from '../constants'
import { logger } from '../logs/logger';


const {DELETE_OPERATION_FAILED, NOT_FOUND} = errors;
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
        case 'message':
            return {'message': { "$regex": value, $options: 'i'}}
        default:
            return {}
    }
}


/**
 * set the date filter condition
 * @function setLogDateFilter
 * @param {string} startDate - The date's lower range limit
 * @param {string} endDate - The date's upper range limit
 * @returns {string}
 */

function setLogDateFilter (startDate: string, endDate: string) {
    let condition = {}
    if (startDate && startDate.length > 0 && !endDate) {
        condition = {
            timestamp : {
                $gt: new Date(startDate).toISOString()
            }
        }
    }
    else if (!startDate && endDate && endDate.length > 0) {
        condition = {
            timestamp : {
                $lt: new Date(endDate).toISOString()
            }
        }
    }
    else if (startDate && startDate.length > 0 && endDate && endDate.length > 0) {
        condition = {
            $and: [
                {
                    timestamp: {
                        $gt: new Date(startDate).toISOString()
                    }
                },
                {
                    timestamp: {
                        $lt: new Date(endDate).toISOString()
                    }
                }
            ]
        }
    }
    else {
        condition = {}
    }

    return condition
}

// get all logs (with or without query string)
LogRouter.get('/api/logs', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        let filter: any = {}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                let dateFilter = setLogDateFilter(req.query['startDate']?.toString()??'', req.query['endDate']?.toString()??'')
                filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) :  filter
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const logs = await Log.find(filter)
        res.send({ok: true, data: logs})
    } catch (error) {
        logger.error(`An Error occured while querying log list due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
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
        res.status(400).send({ok:false, error})
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
        res.status(400).send({ok:false, error})
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