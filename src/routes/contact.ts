import express, { Request, Response } from 'express'
import { DELETE_OPERATION_FAILED, NOT_FOUND } from '../constants/error';
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { Contact } from "../models/contact";
import { mailer } from '../helper/mailer';
import {notifyNewContactMe} from '../utils/mailer-templates'

const ContactRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'replied':
            return {'replied': value}
        case 'fullname':
            return {fullname: { "$regex": value, $options: 'i'}}
        case 'email':
            return {'email': value}
        default:
            return {}
    }
}

// ***************************** public enpoints ***********************************************

// create new contact
ContactRouter.post('/api/contacts', async (req: Request, res: Response) => {
    try {
        const {fullname, email, phone } = req.body
        const newContact = new Contact({
            fullname,
            email,
            phone
        })
        const contact = await newContact.save()
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`
        const _success = await mailer(process.env.SENDGRID_VERIFIED_SENDER, notifyNewContactMe.subject, notifyNewContactMe.heading,
        notifyNewContactMe.detail, _link, notifyNewContactMe.linkText )

        res.send({ok: true, data: contact})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// get all contact (with or without query string)
ContactRouter.get('/api/contacts', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
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
        const contacts = await Contact.find(filter)
        res.send({ok: true, data: contacts})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get single contact by id
ContactRouter.get('/api/contacts/:id', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findById(req.params.id)
        if (!contact) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: contact})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// make contact as replied
ContactRouter.patch('/api/contacts/:id/reply', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findById(req.params.id)
        if (!contact) {
            throw NOT_FOUND
        }
        contact.replied = true
        contact.updated = Date.now()

        const updateContact = await contact.save()
        res.send({ok: true, data: updateContact})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

// delete contact
ContactRouter.delete('/api/contacts/:id/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findById(req.params.id)
        if (!contact) {
            throw NOT_FOUND
        }
        const deleteResult = await Contact.deleteOne({_id: contact._id})
        if (deleteResult.deletedCount !== 1) {
            throw DELETE_OPERATION_FAILED
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})


export {
    ContactRouter
}