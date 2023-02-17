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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connectRedis = require('connect-redis');
const redis_1 = require("redis");
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// local module imports
const dbconfig_1 = require("./config/dbconfig");
const auth_middleware_1 = require("./middleware/auth-middleware");
// import router
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
const cron_1 = __importDefault(require("./services/cron"));
// global settings
dotenv_1.default.config();
(0, dbconfig_1.connectDb)();
(0, auth_middleware_1.passportConfig)();
// configure Redis
const redisClient = (0, redis_1.createClient)({ legacyMode: true });
redisClient.connect().catch(console.error);
const RedisStore = connectRedis(express_session_1.default);
// declare and initail parameters
const app = (0, express_1.default)();
exports.app = app;
const SESSION_SECRET = process.env.SESSION_SECRET;
// middleware
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
// start all cron jobs
(0, cron_1.default)();
//  Routes
app.get('/api/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send({ foo: 'bar' });
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}));
//# sourceMappingURL=server.js.map