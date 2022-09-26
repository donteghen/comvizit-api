import express, {Request, Response} from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

// local module imports
import {connectDb} from './config/dbconfig'

// global settings
dotenv.config()
connectDb()
const PORT = process.env.PORT
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


// start server
app.listen(PORT, () => {
    console.log(`Server is listining at: http://loccalhost:${PORT}`)
})

export {app}