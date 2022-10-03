import express, { Request, Response } from 'express'
import { Contact } from "../models/contact";
import adminAuth from '../middleware';
const ContactRouter = express.Router()

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

        res.send({ok: true, data: contact})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// get all contact (with or without query string)
ContactRouter.get('/api/contacts', adminAuth, async (req: Request, res: Response) => {
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
        res.status(400).send({ok:false, error: error.message})
    }
})

// get single contact by id
ContactRouter.get('/api/contacts/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findById(req.params.id)
        if (!contact) {
            throw new Error('Not Found!')
        }
        res.send({ok: true, data: contact})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// make contact as replied
ContactRouter.patch('/api/contacts/:id/reply', async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findById(req.params.id)
        if (!contact) {
            throw new Error('Not Found!')
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
        res.status(400).send({ok:false, error:error?.message})
    }
})

// delete contact
ContactRouter.delete('/api/contacts/:id', async (req: Request, res: Response) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id)
        if (!contact) {
            throw new Error('Not Found!')
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})


export {
    ContactRouter
}