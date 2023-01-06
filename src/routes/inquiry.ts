import express, { Request, Response } from 'express'
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { Inquiry } from "../models/inquiry";
import { mailer } from '../helper/mailer';
import {notifyNewInquiry} from '../utils/mailer-templates'
import { NOT_FOUND } from '../constants/error';


const InquiryRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'replied':
            return {'replied': value}
        case 'email':
            return {'email': value}
        case 'fullname':
            return {'fullname': { "$regex": value, $options: 'i'}}
        default:
            return {}
    }
}

// ***************************** public enpoints ***********************************************

// create new inquiry
InquiryRouter.post('/api/inquiries', async (req: Request, res: Response) => {
    try {
        const {fullname, email, phone, subject, message } = req.body
        const newInquiry = new Inquiry({
            fullname,
            email,
            phone,
            subject,
            message
        })
        const inquiry = await newInquiry.save()

        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`
        const _success = await mailer(process.env.SENDGRID_VERIFIED_SENDER, notifyNewInquiry.subject, notifyNewInquiry.heading,
        notifyNewInquiry.detail, _link, notifyNewInquiry.linkText )

        res.send({ok: true, data: inquiry})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// get all inquiries (with or without query string)
InquiryRouter.get('/api/inquiries', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
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
        const inquiries = await Inquiry.find(filter)
        res.send({ok: true, data: inquiries})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get single inquiry by id
InquiryRouter.get('/api/inquiries/:id', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
        if (!inquiry) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: inquiry})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// make inquiry as replied
InquiryRouter.patch('/api/inquiries/:id/reply', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
        if (!inquiry) {
            throw NOT_FOUND
        }

        inquiry.replied = true
        inquiry.updated = Date.now()

        const updateInquiry = await inquiry.save()
        res.send({ok: true, data: updateInquiry})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

// delete inquiries
InquiryRouter.delete('/api/inquiries/:id/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id)
        if (!inquiry) {
            throw NOT_FOUND
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})


export {
    InquiryRouter
}