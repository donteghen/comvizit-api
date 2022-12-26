import express, { Request, Response } from 'express'
import { NOT_FOUND, DELETE_OPERATION_FAILED } from '../constants/error';
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { Complain } from "../models/complain";
import { mailer } from '../helper/mailer';
import {notifyNewComplained} from '../utils/mailer-templates'


const ComplainRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'processed':
            return {'replied': value}
        case 'email':
            return {'email': value}
        default:
            return {}
    }
}

// ***************************** public enpoints ***********************************************

// create new complain
ComplainRouter.post('/api/complains', async (req: Request, res: Response) => {
    try {
        const {fullname, email, phone, target, subject, message } = req.body
        const newComplain = new Complain({
            fullname,
            email,
            phone,
            target,
            subject,
            message
        })
        const complain = await newComplain.save()

        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/dashboard`
        const _success = await mailer(process.env.SENDGRID_VERIFIED_SENDER, notifyNewComplained.subject, notifyNewComplained.heading,
            notifyNewComplained.detail, _link, notifyNewComplained.linkText )

        res.send({ok: true, data: complain})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// get all complains (with or without query string)
ComplainRouter.get('/api/complains', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
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
        // console.log(error)
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
        const complain = await Complain.findByIdAndDelete(req.params.id)
        if (!complain) {
            throw DELETE_OPERATION_FAILED
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

export {
    ComplainRouter
}