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
exports.RentIntensionRouter = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const user_1 = require("../models/user");
const error_1 = require("../constants/error");
const auth_middleware_1 = require("../middleware/auth-middleware");
const rent_intension_1 = require("../models/rent-intension");
const queryMaker_1 = require("../utils/queryMaker");
const mailer_1 = require("../helper/mailer");
const mailer_templates_1 = require("../utils/mailer-templates");
const RentIntensionRouter = express_1.default.Router();
exports.RentIntensionRouter = RentIntensionRouter;
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
// ***************************** tenant restricted enpoints ***********************************************
// create a new rent-intension
RentIntensionRouter.post('/api/rent-intensions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { propertyId, landlordId, potentialTenantId, comment } = req.body;
        // check if this potential tenant already has an initiated rent-intention
        const thrityDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const existAlready = yield rent_intension_1.RentIntension.findOne({
            $and: [
                { propertyId: new mongoose_1.Types.ObjectId(propertyId) },
                { landlordId: new mongoose_1.Types.ObjectId(landlordId) },
                { potentialTenantId: new mongoose_1.Types.ObjectId(potentialTenantId) },
                { status: { $ne: 'INITIATED' }
                },
                { initiatedAt: {
                        $lt: thrityDaysAgo
                    } }
            ]
        });
        if (existAlready) {
            throw error_1.RENTINTENSION_ALREADY_EXISTS;
        }
        const newRentIntension = new rent_intension_1.RentIntension({
            propertyId,
            landlordId,
            potentialTenantId,
            comment
        });
        // get the corresponsing landlord so that we can get the fullname to be used in the email template
        const _landlord = yield user_1.User.findById(landlordId);
        yield newRentIntension.save();
        // Send a notification email to the admin
        const _link = `${process.env.CLIENT_URL}/admin/dashboard`;
        const _success = yield (0, mailer_1.mailer)(process.env.SENDGRID_VERIFIED_SENDER, mailer_templates_1.notifyNewRentIntensionToAdmin.subject, mailer_templates_1.notifyNewRentIntensionToAdmin.heading, mailer_templates_1.notifyNewRentIntensionToAdmin.detail, _link, mailer_templates_1.notifyNewRentIntensionToAdmin.linkText);
        // Send a notification email to landlord
        const link = `${process.env.CLIENT_URL}/profile`;
        const { subject, heading, detail, linkText } = (0, mailer_templates_1.notifyRentIntensionToLandlord)(_landlord.fullname);
        const success = yield (0, mailer_1.mailer)(_landlord.email, subject, heading, detail, _link, linkText);
        // send the response
        res.send({ ok: true });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
    }
}));
// ***************************** Landlord restricted enpoints ***********************************************
// ***************************** Admin restricted enpoints ***********************************************
// get all rentIntensions
RentIntensionRouter.get('/api/rent-intensions', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
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
        const rentIntensions = yield rent_intension_1.RentIntension.aggregate((0, queryMaker_1.rentIntensionLookup)(filter));
        res.send({ ok: true, data: rentIntensions });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// delete a rent-intension
RentIntensionRouter.delete('/api/rent-intensions/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const deletedRentIntension = yield rent_intension_1.RentIntension.findById(req.params.id);
        if (!deletedRentIntension) {
            throw error_1.NOT_FOUND;
        }
        const deleteResult = yield rent_intension_1.RentIntension.deleteOne({ _id: deletedRentIntension._id });
        if (deleteResult.deletedCount !== 1) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
    }
}));
//# sourceMappingURL=rent-intension.js.map