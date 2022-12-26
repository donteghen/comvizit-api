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
exports.FeaturedRouter = void 0;
const express_1 = __importDefault(require("express"));
const error_1 = require("../constants/error");
const auth_middleware_1 = require("../middleware/auth-middleware");
const featured_properties_1 = require("../models/featured-properties");
const FeaturedRouter = express_1.default.Router();
exports.FeaturedRouter = FeaturedRouter;
/**
 * Get featured properties search query filter
 * @Method Tag
 * @param {string} key
 * @param {any} value
 * @returns {any} any
 */
function setFilter(key, value) {
    switch (key) {
        case 'propertyId':
            return { 'propertyId': value };
        case 'status':
            return { 'status': value };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// get all featured properties (with or without query string)
FeaturedRouter.get('/api/featured/properties', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const featuredProperties = yield featured_properties_1.FeaturedProperties.find(filter);
        res.send({ ok: true, data: featuredProperties });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
    }
}));
// get a singlefeatured property by Id
FeaturedRouter.get('/api/featured/properties/:propertyId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const featuredProperty = yield featured_properties_1.FeaturedProperties.findById(req.params.propertyId);
        if (!featuredProperty) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: featuredProperty });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// create new featured property
FeaturedRouter.post('/api/featured/properties/create', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { propertyId, duration } = req.body;
        const AlreadyFeatured = yield featured_properties_1.FeaturedProperties.findOne({ propertyId });
        if (AlreadyFeatured) {
            throw error_1.PROPERTY_IS_ALREADY_FEATURED;
        }
        const newFeaturedProperty = new featured_properties_1.FeaturedProperties({
            propertyId,
            duration: Number(duration)
        });
        const featuredProperty = yield newFeaturedProperty.save();
        res.send({ ok: true, data: featuredProperty });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
    }
}));
// update featured property's status
FeaturedRouter.patch('/api/featured/properties/:propertyId/status/update', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        if (req.body.status) {
            const featuredProperty = yield featured_properties_1.FeaturedProperties.findById(req.params.propertyId);
            if (!featuredProperty) {
                throw error_1.NOT_FOUND;
            }
            featuredProperty.status = req.body.status;
            const updateFeaturedProperty = yield featuredProperty.save();
            res.send({ ok: true, data: updateFeaturedProperty });
        }
        else {
            throw error_1.INVALID_REQUEST;
        }
    }
    catch (error) {
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
// delete a featured property by id
FeaturedRouter.delete('/api/featured/properties/:propertyId/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const featuredProperty = yield featured_properties_1.FeaturedProperties.findByIdAndDelete(req.params.propertyId);
        if (!featuredProperty) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_e = error.code) !== null && _e !== void 0 ? _e : 1000 });
    }
}));
//# sourceMappingURL=featured-properties.js.map