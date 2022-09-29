import {Owner} from '../models/owner'
import express, { Request, Response } from 'express'
import adminAuth from '../middleware'

const OwnerRouter = express.Router()

// query helper function
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'name':
            return {'name': { "$regex": value, $options: 'i'}}
        case 'email':
            return {'email': value}
        default:
            return {}
    }
}


// ***************************** public enpoints ***********************************************


// get single owner
OwnerRouter.get('/api/owners/:id', async (req: Request, res: Response) => {
    try {
        const owner = await Owner.findById(req.params.id)
        if (!owner) {
            throw new Error('Not Found!')
        }
        res.send({ok: true, data: owner})
    } catch (error) {
        res.status(400).send({ok: false, error: error.message})
    }
})


// ***************************** admin restricted endpoints ***********************************************

// create new owner account
OwnerRouter.post('/api/owners', adminAuth, async (req: Request, res: Response) => {
    try {
        const {fullname, email, phone, address} = req.body
        const newOwner = new Owner({
            fullname,
            email,
            phone,
            address
        })
        const owner = await newOwner.save()
        res.status(201).send({ok: true, data: owner})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message})
    }
})

// get all owners
OwnerRouter.get('/api/owners', adminAuth, async (req: Request, res: Response) => {
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
        const owners = await Owner.find(filter)
        res.send({ok: true, data: owners})
    } catch (error) {
        res.status(400).send({ok: false, error: error.message})
    }
})



// update owner account
OwnerRouter.patch('/api/owners/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const update: any = {}
        Object.keys(req.body).forEach(key => {
            update[key] = req.body[key]
        })
        if (Object.keys(update).length > 0) {
            update.updated = Date.now()
        }
        const updatedOwner = await Owner.findByIdAndUpdate(req.params.id, {$set: update})
        if (!updatedOwner) {
            throw new Error('Update request failed!')
        }

        res.send({ok: true, data: updatedOwner})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:'Validation Error!'})
            return
        }
        res.status(400).send({ok:false, error: error.message})
    }
})


// delete owner account
OwnerRouter.delete('/api/owners/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const deletedOwner = await Owner.findByIdAndDelete(req.params.id)
        if (!deletedOwner) {
            throw new Error('Owner delete operation failed!')
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

export {
    OwnerRouter
}