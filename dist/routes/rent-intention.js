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
exports.RentIntentionRouter = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const user_1 = require("../models/user");
const error_1 = require("../constants/error");
const auth_middleware_1 = require("../middleware/auth-middleware");
const rent_intention_1 = require("../models/rent-intention");
const queryMaker_1 = require("../utils/queryMaker");
const mailer_1 = require("../helper/mailer");
const mailer_templates_1 = require("../utils/mailer-templates");
const logger_1 = require("../logs/logger");
const property_1 = require("../models/property");
const declared_1 = require("../constants/declared");
const RentIntentionRouter = express_1.default.Router();
exports.RentIntentionRouter = RentIntentionRouter;
// query helper function
function setFilter(key, value) {
    switch (key) {
        case '_id':
            return { '_id': value };
        case 'propertyId':
            return { 'propertyId': new mongoose_1.Types.ObjectId(value) };
        case 'landlordId':
            return { 'landlordId': new mongoose_1.Types.ObjectId(value) };
        case 'potentialTenantId':
            return { 'potentialTenantId': new mongoose_1.Types.ObjectId(value) };
        case 'status':
            return { 'status': value };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// ***************************** Shared enpoints ***********************************************
// get  rentIntentions
RentIntentionRouter.get('/api/rent-intentions', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let filter = {};
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const rentIntentions = yield rent_intention_1.RentIntention.aggregate((0, queryMaker_1.rentIntentionLookup)(filter));
        res.send({ ok: true, data: rentIntentions });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying rent-intention list due to ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// get a rentIntention's detail
RentIntentionRouter.get('/api/rent-intentions/:id', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const rentIntention = yield rent_intention_1.RentIntention.aggregate((0, queryMaker_1.singleRentIntentionLookup)(req.params.id));
        if (!(rentIntention.length > 0)) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: rentIntention[0] });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying the details of the rent-intention with id: ${req.params.id} due to ${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
// ***************************** tenant restricted enpoints ***********************************************
// create a new rent-intension
RentIntentionRouter.post('/api/rent-intentions', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    try {
        const { propertyId, landlordId, comment } = req.body;
        // check if this potential tenant already has an initiated rent-intention
        const thrityDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const existAlready = yield rent_intention_1.RentIntention.findOne({
            propertyId: new mongoose_1.Types.ObjectId(propertyId),
            landlordId: new mongoose_1.Types.ObjectId(landlordId),
            potentialTenantId: new mongoose_1.Types.ObjectId(req.user.id),
            status: 'INITIATED',
            initiatedAt: {
                $gt: thrityDaysAgo
            }
        });
        if (existAlready) {
            throw error_1.RENTINTENTION_ALREADY_EXISTS;
        }
        // a strict casting is added to prevent future bug introduction in the database
        const newRentIntention = new rent_intention_1.RentIntention({
            propertyId: new mongoose_1.Types.ObjectId(propertyId.toString()),
            landlordId: new mongoose_1.Types.ObjectId(landlordId.toString()),
            potentialTenantId: new mongoose_1.Types.ObjectId(req.user.id),
            comment
        });
        // get the corresponsing landlord so that we can get the fullname to be used in the email template
        const _landlord = yield user_1.User.findById(landlordId);
        yield newRentIntention.save();
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`;
        const _success = yield (0, mailer_1.mailer)(process.env.SENDGRID_VERIFIED_SENDER, mailer_templates_1.notifyNewRentIntentionToAdmin.subject, mailer_templates_1.notifyNewRentIntentionToAdmin.heading, mailer_templates_1.notifyNewRentIntentionToAdmin.detail, _link, mailer_templates_1.notifyNewRentIntentionToAdmin.linkText);
        // Send a notification email to landlord
        const link = `${process.env.CLIENT_URL}/profile`;
        const { subject, heading, detail, linkText } = (0, mailer_templates_1.notifyRentIntentionToLandlord)(_landlord.fullname);
        const success = yield (0, mailer_1.mailer)(_landlord.email, subject, heading, detail, _link, linkText);
        // send the response
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while creating a new rent-intention for property with id: ${req.body.propertyId} by user with id: ${req.user.id} due to ${(_e = error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_f = error.code) !== null && _f !== void 0 ? _f : 1000 });
    }
}));
// ***************************** Landlord restricted enpoints ***********************************************
// ***************************** Admin restricted enpoints ***********************************************
// update the rent-intension status
RentIntentionRouter.patch('/api/rent-intentions/:id/status-update', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j, _k, _l;
    try {
        // get the corresponding rent-intension by id
        const rentIntention = yield rent_intention_1.RentIntention.findById(req.params.id);
        if (!rentIntention) {
            throw error_1.NOT_FOUND;
        }
        // check if user is admin or landlord related to the current transaction (rent-intentsion)
        if (((_g = req.user) === null || _g === void 0 ? void 0 : _g.role) !== declared_1.constants.USER_ROLE.ADMIN) {
            if (((_h = req.user) === null || _h === void 0 ? void 0 : _h.role) === declared_1.constants.USER_ROLE.LANDLORD) {
                if (rentIntention.landlordId.toString() !== ((_j = req.user) === null || _j === void 0 ? void 0 : _j.id))
                    throw error_1.NOT_AUTHORIZED;
            }
        }
        rentIntention.status = req.body.status ? req.body.status : rentIntention.status;
        const updatedRentItention = yield rentIntention.save();
        // update the related property's status
        const relatedProperty = yield property_1.Property.findOne({
            _id: rentIntention.propertyId,
            status: { $nin: [declared_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.UNAVAILABLE] }
        });
        if (!relatedProperty) {
            throw error_1.NOT_FOUND;
        }
        switch (updatedRentItention.status) {
            case declared_1.constants.RENT_INTENTION_STATUS_OPTIONS.CONFIRMED:
                relatedProperty.availability = declared_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.BOOKED;
                yield relatedProperty.save();
                break;
            case declared_1.constants.RENT_INTENTION_STATUS_OPTIONS.CANCELED:
                relatedProperty.availability = declared_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE;
                yield relatedProperty.save();
                break;
            default:
                break;
        }
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while updating the details of the rent-intention with id: ${req.params.id} due to ${(_k = error === null || error === void 0 ? void 0 : error.message) !== null && _k !== void 0 ? _k : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_l = error.code) !== null && _l !== void 0 ? _l : 1000 });
    }
}));
// delete a rent-intension
RentIntentionRouter.delete('/api/rent-intentions/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o;
    try {
        const deletedRentIntention = yield rent_intention_1.RentIntention.findById(req.params.id);
        if (!deletedRentIntention) {
            throw error_1.NOT_FOUND;
        }
        const deleteResult = yield rent_intention_1.RentIntention.deleteOne({ _id: deletedRentIntention._id });
        if (deleteResult.deletedCount !== 1) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while deleting the rent-intention with id: ${req.params.id} due to ${(_m = error === null || error === void 0 ? void 0 : error.message) !== null && _m !== void 0 ? _m : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_o = error.code) !== null && _o !== void 0 ? _o : 1000 });
    }
}));
//# sourceMappingURL=rent-intention.js.map