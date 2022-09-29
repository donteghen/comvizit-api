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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// local module imports
const dbconfig_1 = require("./config/dbconfig");
// import router
const owner_1 = require("./routes/owner");
const property_1 = require("./routes/property");
const inquiry_1 = require("./routes/inquiry");
const contact_1 = require("./routes/contact");
// global settings
dotenv_1.default.config();
(0, dbconfig_1.connectDb)();
// declare and initail parameters
const app = (0, express_1.default)();
exports.app = app;
// middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(property_1.PropertyRouter);
app.use(owner_1.OwnerRouter);
app.use(contact_1.ContactRouter);
app.use(inquiry_1.InquiryRouter);
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