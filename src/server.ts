import express, {Request, Response} from 'express'

import cors from 'cors'
import dotenv from 'dotenv'

// local module imports
import {connectDb} from './config/dbconfig'

// import router
import { OwnerRouter } from './routes/owner'
import { PropertyRouter } from './routes/property'
import { InquiryRouter } from './routes/inquiry'
import { ContactRouter } from './routes/contact'

// global settings
dotenv.config()
connectDb()




// declare and initail parameters
const app = express()


// middleware
app.use(cors())
app.use(express.json())
app.use(PropertyRouter)
app.use(OwnerRouter)
app.use(ContactRouter)
app.use(InquiryRouter)

//  Routes
app.get('/api/', async (req: Request, res: Response) => {
    try {
        res.send({foo: 'bar'})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

export {app}