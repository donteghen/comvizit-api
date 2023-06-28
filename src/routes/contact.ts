import express, { Request, Response } from 'express'
import { DELETE_OPERATION_FAILED, NOT_FOUND } from '../constants/error';
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { Contact } from "../models/contact";
import { mailer } from '../helper/mailer';
import {notifyNewContactMe} from '../utils/mailer-templates'
import { logger } from '../logs/logger';
import { setDateFilter } from '../utils/date-query-setter';

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
        logger.error(`An error occured while creating a new contactme message due to : ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// get all contact (with or without query string)
ContactRouter.get('/api/contacts', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        let filter: any = {}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            let dateFilter = setDateFilter(req.query['startDate']?.toString()??'', req.query['endDate']?.toString()??'')
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) :  filter
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]))
                }
            })
        }
        const contacts = await Contact.find(filter)
        res.send({ok: true, data: contacts})
    } catch (error) {
        logger.error(`An error occured querying contactme list due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
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
        logger.error(`An error occured while querying the contactme details with id: ${req.params.id} due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
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
        logger.error(`An error occured while updating the replied status of the contactme with id: ${req.params.id} due to : ${error?.message??'Unknown Source'}`)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error})
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
        logger.error(`An error occured while deleting the contactme message with id: ${req.params.id} due to : ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error})
    }
})


export {
    ContactRouter
}