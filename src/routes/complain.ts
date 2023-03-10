import express, { Request, Response } from 'express'
import { NOT_FOUND, DELETE_OPERATION_FAILED } from '../constants/error';
import { isAdmin, isLoggedIn, isTenant } from '../middleware/auth-middleware';
import { Complain } from "../models/complain";
import { mailer } from '../helper/mailer';
import {notifyNewComplained} from '../utils/mailer-templates'
import { Types } from 'mongoose';
import { logger } from '../logs/logger';


const ComplainRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case '_id':
            return {'_id': value}
        case 'processed':
            let v: any
            if (typeof value === 'string') {
                v = value === 'true' ? true : false
            }
            else {
                v = value
            }
            return {'processed': v}
        case 'type':
            return {'type': value}
        case 'plaintiveId':
            return {'plaintiveId': new Types.ObjectId(value)}
        case 'targetId':
            return {'targetId': new Types.ObjectId(value)}
        default:
            return {}
    }
}

// ***************************** public enpoints ***********************************************

// create new complain
ComplainRouter.post('/api/complains', isLoggedIn, isTenant, async (req: Request, res: Response) => {
    try {
        const {type, targetId, subject, message } = req.body
        const newComplain = new Complain({
            plaintiveId: new Types.ObjectId(req.user.id),
            type,
            targetId,
            subject,
            message
        })
        const complain = await newComplain.save()

        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`
        const _success = await mailer(process.env.SENDGRID_VERIFIED_SENDER, notifyNewComplained.subject, notifyNewComplained.heading,
            notifyNewComplained.detail, _link, notifyNewComplained.linkText )

        res.send({ok: true, data: complain})
    } catch (error) {
        logger.error(`An error occured while creating a complain due to : ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// get all complains (with or without query string)
ComplainRouter.get('/api/complains', isLoggedIn, async (req: Request, res: Response) => {
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
        const complains = await Complain.find(filter)
        res.send({ok: true, data: complains})
    } catch (error) {
        logger.error(`An error occured while querying complain list due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get single complain by id
ComplainRouter.get('/api/complains/:id', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const complain = await Complain.findById(req.params.id)
        if (!complain) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: complain})
    } catch (error) {
        logger.error(`An error occured while querying complain detail by id: ${req.params.id} due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error: error.message})
    }
})

// make complain as processed
ComplainRouter.patch('/api/complains/:id/process', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const complain = await Complain.findById(req.params.id)
        if (!complain) {
            throw NOT_FOUND
        }
        complain.processed = true
        complain.updated = Date.now()

        const updateComplain = await complain.save()
        res.send({ok: true, data: updateComplain})
    } catch (error) {
        logger.error(`An error occured while updating the complain with id: ${req.params.id} due to : ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

// delete a complain by id
ComplainRouter.delete('/api/complains/:id/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const complain = await Complain.findById(req.params.id)
        if (!complain) {
            throw NOT_FOUND
        }
        const deleteResult = await Complain.deleteOne({_id: complain._id})
        if (deleteResult.deletedCount !== 1) {
            throw DELETE_OPERATION_FAILED
        }
        res.send({ok: true})
    } catch (error) {
        logger.error(`An error occured while deleting the complain with id: ${req.params.id} due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error:error?.message})
    }
})

export {
    ComplainRouter
}