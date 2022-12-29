import express, { Request, Response } from 'express'
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { Tag } from "../models/tag";
import {DELETE_OPERATION_FAILED, INVALID_REQUEST, NOT_FOUND, SAVE_OPERATION_FAILED, TAG_ALREADY_EXISTS} from '../constants/error'
import {Types} from 'mongoose';

const TagRouter = express.Router()

/**
 * Get tag search query filter
 * @Method Tag
 * @param {string} key
 * @returns {any} any
 */
function setFilter(key:string, value:any): any {
    switch (key) {
        case 'type':
            return {'type': value}
        case 'title':
            return {'title': value}
        case 'status':
            return {'status': value}
        case 'code':
            return {'code': value}
        case 'refId':
            return {'refId': new Types.ObjectId(value)}
        default:
            return {}
    }
}

// ***************************** public enpoints ***********************************************

// create new tag
TagRouter.post('/api/tags/add', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const {type, title, code, status, refId, cratedDate} = req.body
        const existAlready = await Tag.findOne({$and: [{refId}, {code}]})
        if (existAlready) {
            if (existAlready.status === 'Active') {
                throw TAG_ALREADY_EXISTS(existAlready.code, existAlready.type, existAlready.refId.toString())
            }
            existAlready.status = 'Active'
            await existAlready.save()
            res.send({ok: true, data: existAlready})
            return
        }

        const newTag = new Tag({
            code,
            type,
            title,
            status,
            refId: new Types.ObjectId(refId),
            cratedDate : Number(cratedDate)
        })
        const tag = await newTag.save()
        if (!tag) {
            throw NOT_FOUND
        }

        res.send({ok: true, data: tag})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get all tags (with or without query string)
TagRouter.get('/api/tags', async (req: Request, res: Response) => {
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
        const tags = await Tag.find(filter)
        res.send({ok: true, data: tags})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})

// get a single tag by id
TagRouter.get('/api/tags/:id',  async (req: Request, res: Response) => {
    try {
        const tag = await Tag.findById(req.params.id)
        if (!tag) {
            throw NOT_FOUND
        }
        res.send({ok: true, data: tag})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message, code: error.code??1000})
    }
})


// ***************************** admin enpoints ***********************************************


// update tag's status
TagRouter.patch('/api/tags/:id/update', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        if (req.body.status) {
            const tag = await Tag.findById(req.params.id)
            if (!tag) {
                throw NOT_FOUND
            }
            tag.status = req.body.status
            const updatedTag = await tag.save()
            if (!updatedTag) {
                throw SAVE_OPERATION_FAILED
            }
            res.send({ok: true, data: updatedTag})
        }
        else {
            throw INVALID_REQUEST
        }
    } catch (error) {
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

// delete a tag by id
TagRouter.delete('/api/tags/:id/delete', isLoggedIn, isAdmin, async (req: Request, res: Response) => {
    try {
        const tag = await Tag.findByIdAndDelete(req.params.id)
        if (!tag) {
            throw DELETE_OPERATION_FAILED
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

export {
    TagRouter
}