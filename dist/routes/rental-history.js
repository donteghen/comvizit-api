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
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const error_1 = require("../constants/error");
const auth_middleware_1 = require("../middleware/auth-middleware");
const rental_history_1 = require("../models/rental-history");
const mailer_1 = require("../helper/mailer");
const mailer_templates_1 = require("../utils/mailer-templates");
const user_1 = require("../models/user");
const queryMaker_1 = require("../utils/queryMaker");
const RentalHistoryRouter = express_1.default.Router();
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'propertyId':
            return { 'propertyId': new mongoose_1.Types.ObjectId(value) };
        case 'landlordId':
            return { landlordId: new mongoose_1.Types.ObjectId(value) };
        case 'tenantId':
            return { 'tenantId': new mongoose_1.Types.ObjectId(value) };
        case 'startDate':
            return { startDate: { $lte: value } };
        case 'endDate':
            return { endDate: { $lte: value } };
        case 'status':
            return { endDate: { $lte: value } };
        default:
            return {};
    }
}
/**
 * dateSetter helper function, is a function that helps set the query filter based on startDate and endDate
 * @function
 * @param {any} reqParams - The provided search query object
 * @param {string} dateQuery - The provided query key
 * @param {Array<string>} queryArray - The current collection of the query keys
 * @returns {any} - Query condition
 */
function dateSetter(reqParams, queryArray, dateQuery) {
    // console.log(priceQuery, Number.parseInt(reqParams['minprice'], 10), Number.parseInt(reqParams['maxprice'], 10))
    if (dateQuery === 'startDate') {
        if (queryArray.includes('endDate')) {
            return { $and: [{ 'startDate': { $gte: Number(reqParams['startDate']) } }, { 'endDate': { $lte: Number(reqParams['endDate']) } }] };
        }
        return { 'startDate': { $gte: Number(reqParams['startDate']) } };
    }
    else if (dateQuery === 'endDate') {
        if (queryArray.includes('startDate')) {
            return { $and: [{ 'startDate': { $gte: Number(reqParams['startDate']) } }, { 'endDate': { $lte: Number(reqParams['endDate']) } }] };
        }
        return { 'endDate': { $lte: Number(reqParams['endDate']) } };
    }
}
// ***************************** public enpoints ***********************************************
// ***************************** Shared enpoints ***********************************************
// get rental history list
RentalHistoryRouter.get('/api/rental-histories', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let filter = {};
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'startDate' || key === 'endDate') {
                        filter = Object.assign(filter, dateSetter(req.query, queries, key));
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const rentalHistoryList = yield rental_history_1.RentalHistory.aggregate((0, queryMaker_1.rentalHistoryLookup)(filter));
        res.send({ ok: true, data: rentalHistoryList });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
    }
}));
// get rental history detail
RentalHistoryRouter.get('/api/rental-histories/id/detail', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        if (!req.params.id) {
            throw error_1.INVALID_REQUEST;
        }
        const rentalHistory = yield rental_history_1.RentalHistory.aggregate((0, queryMaker_1.singleRentalHistoryLookup)(req.params.id));
        if (!rentalHistory) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: rentalHistory });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// ***************************** tenant restricted enpoints ***********************************************
// ***************************** Landlord restricted enpoints ***********************************************
// ***************************** Admin restricted enpoints ***********************************************
// create a new rental histroy
RentalHistoryRouter.post('/api/rental-histories', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { propertyId, landlordId, tenantId, startDate } = req.body;
        if (!propertyId || !landlordId || !tenantId || !startDate) {
            throw error_1.INVALID_REQUEST;
        }
        // check is there is an ongoing rental history for this tenant/landlord/property/status
        const existAlreadyAndOngoing = yield rental_history_1.RentalHistory.findOne({
            propertyId: new mongoose_1.Types.ObjectId(propertyId.toString()),
            landlordId: new mongoose_1.Types.ObjectId(landlordId.toString()),
            tenantId: new mongoose_1.Types.ObjectId(tenantId.toString()),
            status: 'ONGOING'
        });
        if (existAlreadyAndOngoing) {
            throw error_1.RENTALHISTORY_CURRENTLY_ONGOING;
        }
        // create a new rental history record and save it in the database
        const newRentalHistory = new rental_history_1.RentalHistory({
            propertyId: new mongoose_1.Types.ObjectId(propertyId.toString()),
            landlordId: new mongoose_1.Types.ObjectId(landlordId.toString()),
            tenantId: new mongoose_1.Types.ObjectId(tenantId.toString()),
            startDate: Number(startDate)
        });
        const rentalHistory = yield newRentalHistory.save();
        if (!rentalHistory) {
            throw error_1.SAVE_OPERATION_FAILED;
        }
        // get the corresponsing landlord and tenant  so that we can get their fullnames to be used in the email templates
        const _landlord = yield user_1.User.findById(landlordId);
        const _tenant = yield user_1.User.findById(tenantId);
        // send an email to both the tenant and landlord
        const link = `${process.env.CLIENT_URL}/profile`;
        // landlord
        const { subject, heading, detail, linkText } = (0, mailer_templates_1.notifyRentalHistoryCreatedToLandlord)(_landlord.fullname);
        const success = yield (0, mailer_1.mailer)(_landlord.email, subject, heading, detail, link, linkText);
        // tenant
        const { _subject, _heading, _detail, _linkText } = (0, mailer_templates_1.notifyRentalHistoryCreatedToTenant)(_tenant.fullname);
        const _success = yield (0, mailer_1.mailer)(_tenant.email, _subject, _heading, _detail, link, _linkText);
        // send the response
        res.send({ ok: true });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
    }
}));
// terminate a rental history (by updating the status and endDate)
RentalHistoryRouter.patch('/api/rental-histories/:id/terminate', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        // get the corresponding rent-intension by id
        const rentalHistory = yield rental_history_1.RentalHistory.findById(req.params.id);
        if (!rentalHistory) {
            throw error_1.NOT_FOUND;
        }
        // update and save the rentalHistory document
        rentalHistory.status = 'TERMINATED';
        rentalHistory.endDate = Date.now();
        yield rentalHistory.save();
        // notify but tenant and landlord
        const _landlord = yield user_1.User.findById(rentalHistory.landlordId);
        const _tenant = yield user_1.User.findById(rentalHistory.tenantId);
        // send an email to both the tenant and landlord
        const landlordLink = `${process.env.CLIENT_URL}/profile`;
        const tenantLink = `${process.env.CLIENT_URL}/`;
        // landlord
        const { subject, heading, detail, linkText } = (0, mailer_templates_1.notifyRentalHistoryTerminatedToLandlord)(_landlord.fullname);
        const success = yield (0, mailer_1.mailer)(_landlord.email, subject, heading, detail, landlordLink, linkText);
        // tenant
        const { _subject, _heading, _detail, _linkText } = (0, mailer_templates_1.notifyRentalHistoryTerminatedToTenant)(_tenant.fullname);
        const _success = yield (0, mailer_1.mailer)(_tenant.email, _subject, _heading, _detail, tenantLink, _linkText);
        res.send({ ok: true });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
//# sourceMappingURL=rental-history.js.map