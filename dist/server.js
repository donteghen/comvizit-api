"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const logger_1 = require("./logs/logger");
const express_session_1 = __importDefault(require("express-session"));
const connectRedis = require('connect-redis');
const redis_1 = require("redis");
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
// local module imports
// import {connectDb} from './config/dbconfig'
const auth_middleware_1 = require("./middleware/auth-middleware");
;
// import router ;
const property_1 = require("./routes/property");
const inquiry_1 = require("./routes/inquiry");
const contact_1 = require("./routes/contact");
const complain_1 = require("./routes/complain");
const user_1 = require("./routes/user");
const tag_1 = require("./routes/tag");
const review_1 = require("./routes/review");
const like_1 = require("./routes/like");
const favorite_1 = require("./routes/favorite");
const featured_properties_1 = require("./routes/featured-properties");
const rent_intention_1 = require("./routes/rent-intention");
const rental_history_1 = require("./routes/rental-history");
const chat_1 = require("./routes/chat");
const chatmessage_1 = require("./routes/chatmessage");
const log_1 = require("./routes/log");
const cron_1 = __importDefault(require("./services/cron"));
const heartBeat_1 = require("./listeners/heartBeat");
const incomingMessage_1 = require("./listeners/incomingMessage");
// global settings
dotenv_1.default.config();
(0, auth_middleware_1.passportConfig)();
// configure Redis
const redisClient = (0, redis_1.createClient)({ legacyMode: true });
redisClient.connect()
    .catch(error => {
    var _a;
    logger_1.logger.error(`Failed to initialize DB due to:  ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown error'}`);
    console.error(new Date(Date.now()).toLocaleString(), " : Failed to initialize DB", error);
});
const RedisStore = connectRedis(express_session_1.default);
// declare and initail parameters
const app = (0, express_1.default)();
const SESSION_SECRET = process.env.SESSION_SECRET;
const server = new http_1.default.Server(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        allowedHeaders: ['Content-Type', 'Origin', 'Authorization'],
        credentials: true
    }
});
app.use((0, express_session_1.default)({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 6, // session max age in milliseconds
    },
}));
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:8080"],
    allowedHeaders: ['Content-Type', 'Origin', 'Authorization'],
    credentials: true
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(property_1.PropertyRouter);
app.use(contact_1.ContactRouter);
app.use(complain_1.ComplainRouter);
app.use(inquiry_1.InquiryRouter);
app.use(user_1.UserRouter);
app.use(featured_properties_1.FeaturedRouter);
app.use(tag_1.TagRouter);
app.use(review_1.ReviewRouter);
app.use(like_1.LikeRouter);
app.use(favorite_1.FavoriteRouter);
app.use(rent_intention_1.RentIntentionRouter);
app.use(rental_history_1.RentalHistoryRouter);
app.use(chatmessage_1.ChatMessageRouter);
app.use(chat_1.ChatRouter);
app.use(log_1.LogRouter);
// start all cron jobs
(0, cron_1.default)();
//  Routes
app.get('/api/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.logger.info('Someone landed at the route /api/');
        res.send('Wlecome to the comvizit api');
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}));
io.on("connection", (socket) => {
    socket.emit('welcome', 'hi there & welcome');
    // handle heartbeat event handler
    socket.on('heartbeat', function (data) {
        (0, heartBeat_1.onHeartBeat)(socket, data);
    });
    // recieve an outgoing_message event handler
    socket.on('outgoing_message', incomingMessage_1.onOutgoingMessage);
    // disconnection event handler
    socket.on('disconnect', (reason) => {
        // add logger
        console.log(`socket ${socket.id} disconnected due to ${reason}`);
    });
});
//# sourceMappingURL=server.js.map