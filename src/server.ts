import express, {Request, Response} from 'express'

import cors from 'cors'

// local module imports
// import {connectDb} from './config/dbconfig'




// declare and initail parameters
const app = express()


// middleware
app.use(cors())
app.use(express.json())

//  Routes
app.get('/api/', async (req: Request, res: Response) => {
    try {
        res.send({foo: 'bar'})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

export {app}