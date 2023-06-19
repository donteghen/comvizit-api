import express, {Request, Response} from 'express' ;
import http from 'http' ;
import { logger } from './logs/logger' ;
import session from 'express-session' ;
const connectRedis = require('connect-redis') ;
import { createClient } from 'redis' ;
import passport from 'passport' ;
import cors from 'cors' ;
import dotenv from 'dotenv' ;
import { Server } from 'socket.io' ;
import {ClientToServerEventHandlers, ServerToClientEventHandles, InterServerEventHandlers} from './models/socket-interfaces';
// local module imports
// import {connectDb} from './config/dbconfig'
import { passportConfig } from './middleware/auth-middleware'; ;
// import router ;
import { PropertyRouter } from './routes/property' ;
import { InquiryRouter } from './routes/inquiry' ;
import { ContactRouter } from './routes/contact' ;
import {ComplainRouter} from './routes/complain' ;
import {UserRouter} from './routes/user' ;
import {TagRouter} from './routes/tag' ;
import {ReviewRouter} from './routes/review' ;
import {LikeRouter} from './routes/like' ;
import {FavoriteRouter} from './routes/favorite' ;
import {FeaturedRouter} from './routes/featured-properties' ;
import {RentIntentionRouter} from './routes/rent-intention' ;
import {RentalHistoryRouter} from './routes/rental-history' ;
import {ChatRouter} from './routes/chat' ;
import {ChatMessageRouter} from './routes/chatmessage' ;
import { LogRouter } from './routes/log' ;
import cronScheduler from './services/cron' ;

// socket and chat related dependecies
import { IChatMessage } from "./models/interfaces";
import { Heartbeat } from './models/socket-interfaces';
import { Chat } from './models/chat';
import { ChatMessage } from './models/chatmessage';
import { User } from './models/user';
import {onHeartBeat} from './listeners/heartBeat';
import {onOutgoingMessage} from './listeners/incomingMessage';

// global settings
dotenv.config() ;
passportConfig() ;
// configure Redis
const redisClient = createClient({ legacyMode: true });
redisClient.connect()
.catch(error => {
  logger.error(`Failed to initialize DB due to:  ${error?.message??'Unknown error'}`) ;
  console.error(new Date(Date.now()).toLocaleString(), " : Failed to initialize DB", error) ;
});
const RedisStore = connectRedis(session) ;


// declare and initail parameters
const app = express() ;
const SESSION_SECRET = process.env.SESSION_SECRET;
const server = new http.Server(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    allowedHeaders: ['Content-Type', 'Origin', 'Authorization'],
    credentials:true
  }
});

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
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(PropertyRouter) ;
app.use(ContactRouter);
app.use(ComplainRouter);
app.use(InquiryRouter);
app.use(UserRouter);
app.use(FeaturedRouter);
app.use(TagRouter);
app.use(ReviewRouter);
app.use(LikeRouter);
app.use(FavoriteRouter);
app.use(RentIntentionRouter);
app.use(RentalHistoryRouter);
app.use(ChatMessageRouter);
app.use(ChatRouter);
app.use(LogRouter);


// start all cron jobs
cronScheduler();

//  Routes
app.get('/api/', async (req: Request, res: Response) => {
    try {
      logger.info('Someone landed at the route /api/');
        res.send('Wlecome to the comvizit api');
    } catch (error) {
        res.status(400).send(error.message);
    }
})

io.on("connection", (socket) => {
  socket.emit('welcome', 'hi there & welcome')
  // handle heartbeat event handler
  socket.on('heartbeat', function (data: Heartbeat) {
      onHeartBeat(socket, data)
  })

  // recieve an outgoing_message event handler
  socket.on('outgoing_message', onOutgoingMessage)

  // disconnection event handler
  socket.on('disconnect', (reason) => {
      // add logger
      console.log(`socket ${socket.id} disconnected due to ${reason}`);
  })
});

export {
  server
}