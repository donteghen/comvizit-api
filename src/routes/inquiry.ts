import express, { Request, Response } from 'express'
import { Inquiry } from "../models/inquiry";
import adminAuth from '../middleware';

const InquiryRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'replied':
            return {'replied': value}
        case 'email':
            return {'email': value}
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

        res.send({ok: true, data: inquiry})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:'Validation Error!'})
            return
        }
        res.status(400).send({ok:false, error: error.message})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// get all inquiries (with or without query string)
InquiryRouter.get('/api/inquiries', adminAuth, async (req: Request, res: Response) => {
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
        const inquiries = await Inquiry.find(setFilter)
        res.send({ok: true, data: inquiries})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// get single inquiry by id
InquiryRouter.get('/api/inquiries/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
        if (!inquiry) {
            throw new Error('Not Found!')
        }
        res.send({ok: true, data: inquiry})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// make inquiry as replied
InquiryRouter.patch('/api/inquiries/:id/update', async (req: Request, res: Response) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
        if (!inquiry) {
            throw new Error('Not Found!')
        }
        inquiry.replied = true
        const updateInquiry = await inquiry.save()
        res.send({ok: true, data: updateInquiry})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:'Validation Error!'})
            return
        }
        res.status(400).send({ok:false, error:error?.message})
    }
})

// delete inquiries
InquiryRouter.delete('/api/inquiries/:id/update', async (req: Request, res: Response) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id)
        if (!inquiry) {
            throw new Error('Not Found!')
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})


