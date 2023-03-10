import express, { Request, Response } from 'express'
import { isAdmin, isLoggedIn } from '../middleware/auth-middleware';
import { Tag } from "../models/tag";
import {DELETE_OPERATION_FAILED, INVALID_REQUEST, NOT_FOUND, SAVE_OPERATION_FAILED, TAG_ALREADY_EXISTS} from '../constants/error'
import {Types} from 'mongoose';
import { logger } from '../logs/logger';

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
        const {type, title, refId} = req.body
        const code: string = title ? title.toString().toLowerCase().split(' ').join('_') : ''
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
            refId: new Types.ObjectId(refId)
        })
        const tag = await newTag.save()
        if (!tag) {
            throw NOT_FOUND
        }

        res.send({ok: true, data: tag})
    } catch (error) {
        logger.error(`An Error occured while tagging a document with type: ${req.body.type} with refId ${req.body.refId} by admin due to ${error?.message??'Unknown Source'}`)
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
        logger.error(`An Error occured while querying tag list due to ${error?.message??'Unknown Source'}`)
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
        logger.error(`An Error occured while querying the details of the tag with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
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
            tag.updated = Date.now()
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
        logger.error(`An Error occured while updating the status of the tag with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
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
        logger.error(`An Error occured while deleting the tag with id: ${req.params.id} due to ${error?.message??'Unknown Source'}`)
        res.status(400).send({ok:false, error:error?.message, code: error.code??1000})
    }
})

export {
    TagRouter
}