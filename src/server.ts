import express, {Request, Response} from 'express'
import session from 'express-session'
const connectRedis = require('connect-redis')
import { createClient } from 'redis'
import passport from 'passport'
import cors from 'cors'
import dotenv from 'dotenv'


// local module imports
import {connectDb} from './config/dbconfig'
import { passportConfig } from './middleware/auth-middleware'
// import router
import { PropertyRouter } from './routes/property'
import { InquiryRouter } from './routes/inquiry'
import { ContactRouter } from './routes/contact'
import {ComplainRouter} from './routes/complain'
import {UserRouter} from './routes/user'
import {TagRouter} from './routes/tag'
import {ReviewRouter} from './routes/review'
import {LikeRouter} from './routes/like'
import {FavoriteRouter} from './routes/favorite'
import {FeaturedRouter} from './routes/featured-properties'
import {RentIntentionRouter} from './routes/rent-intention'
import {RentalHistoryRouter} from './routes/rental-history'
import cronScheduler from './services/cron'


// global settings
dotenv.config()
connectDb()
passportConfig()
// configure Redis
const redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.error);
const RedisStore = connectRedis(session);


// declare and initail parameters
const app = express()
const SESSION_SECRET = process.env.SESSION_SECRET;

// middleware
app.use(
 session({
   store: new RedisStore({ client: redisClient }),
   secret: SESSION_SECRET,
   resave: false,
   saveUninitialized: false,
   cookie: {
     secure: false,  // if true only transmit cookie over https
     httpOnly: false, // if true prevent client side JS from reading the cookie
     maxAge: 1000 * 60 * 60 * 6, // session max age in milliseconds
   },
 })
);
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8080"],
  allowedHeaders: ['Content-Type', 'Origin', 'Authorization'],
  credentials:true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(PropertyRouter)
app.use(ContactRouter)
app.use(ComplainRouter)
app.use(InquiryRouter)
app.use(UserRouter)
app.use(FeaturedRouter)
app.use(TagRouter)
app.use(ReviewRouter)
app.use(LikeRouter)
app.use(FavoriteRouter)
app.use(RentIntentionRouter)
app.use(RentalHistoryRouter)
// start all cron jobs
cronScheduler();

//  Routes
app.get('/api/', async (req: Request, res: Response) => {
    try {
        res.send({foo: 'bar'})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

export {app}