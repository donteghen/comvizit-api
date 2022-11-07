import express, { Request, Response } from 'express'
import { isLoggedIn } from '../middleware';
import { Complain } from "../models/complain";

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

        res.send({ok: true, data: complain})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message})
    }
})

// ***************************** admin restricted endpoints ***********************************************

// get all complains (with or without query string)
ComplainRouter.get('/api/complains', isLoggedIn,  async (req: Request, res: Response) => {
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
        res.status(400).send({ok:false, error: error.message})
    }
})

// get single complain by id
ComplainRouter.get('/api/complains/:id', isLoggedIn,  async (req: Request, res: Response) => {
    try {
        const complain = await Complain.findById(req.params.id)
        if (!complain) {
            throw new Error('Not Found!')
        }
        res.send({ok: true, data: complain})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// make complain as processed
ComplainRouter.patch('/api/complains/:id/process', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const complain = await Complain.findById(req.params.id)
        if (!complain) {
            throw new Error('Not Found!')
        }
        complain.processed = true
        complain.updated = Date.now()

        const updateComplain = await complain.save()
        res.send({ok: true, data: updateComplain})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error:error?.message})
    }
})

// delete a complain by id
ComplainRouter.delete('/api/complains/:id', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const complain = await Complain.findByIdAndDelete(req.params.id)
        if (!complain) {
            throw new Error('Not Found!')
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})


export {
    ComplainRouter
}