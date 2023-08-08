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
exports.PropertyRouter = void 0;
const express_1 = __importDefault(require("express"));
const constants_1 = require("../constants");
const mongoose_1 = require("mongoose");
const property_1 = require("../models/property");
const user_1 = require("../models/user");
const tag_1 = require("../models/tag");
const featured_properties_1 = require("../models/featured-properties");
const logger_1 = require("../logs/logger");
const complain_1 = require("../models/complain");
const review_1 = require("../models/review");
const like_1 = require("../models/like");
// utils & helpers
const mailer_1 = require("../helper/mailer");
const date_query_setter_1 = require("../utils/date-query-setter");
const queryMaker_1 = require("../utils/queryMaker");
const auth_middleware_1 = require("../middleware/auth-middleware");
const mailer_templates_1 = require("../utils/mailer-templates");
const { DELETE_OPERATION_FAILED, INVALID_REQUEST, NOT_AUTHORIZED, NOT_FOUND, NOT_PROPERTY_OWNER, SAVE_OPERATION_FAILED, NOT_SPECIFIED } = constants_1.errors;
const PropertyRouter = express_1.default.Router();
exports.PropertyRouter = PropertyRouter;
const pageSize = Number(process.env.PAGE_SIZE); // number of documents returned per request for the get all properties route
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'unique_id':
            return { unique_id: Number(value) };
        case 'age':
            return { 'age': { $lte: Number(value) } };
        case 'availability':
            return { 'availability': value };
        case 'bedroomCount':
            return { 'bedroom': value.toString() };
        case 'propertyType':
            return { 'propertyType': value };
        case 'propertySize':
            return { 'propertySize': { $gte: Number.parseInt(value, 10) } };
        case 'distanceFromRoad':
            return { 'distanceFromRoad': { $lte: Number.parseInt(value, 10) } };
        case 'costFromRoad':
            return { 'costFromRoad': { $lte: Number.parseInt(value, 10) } };
        case 'furnishedState':
            return { 'furnishedState': value };
        case 'amenities':
            return { 'amenities': { $all: value } };
        case 'facilities':
            return { 'facilities': { $in: [value] } };
        case 'features':
            return { 'features': { $in: [value] } };
        case 'town':
            return { 'town': { "$regex": value, $options: 'i' } };
        case 'district':
            return { 'district.name': { "$regex": value, $options: 'i' } };
        case 'quater':
            return { 'quater.name': { "$regex": value, $options: 'i' } };
        case 'districtref':
            return { 'district.ref': value };
        case 'quaterref':
            return { 'quater.ref': value };
        case 'featuring':
            return { 'featuring': (value && value === 'true') ? true : false };
        default:
            return {};
    }
}
function setSorter(value) {
    switch (value) {
        case 'HighToLow':
            return { price: -1 };
        case 'LowToHigh':
            return { price: 1 };
        case 'MostRecent':
            return { updated: -1 };
        default:
            return { updated: -1 };
    }
}
function priceSetter(reqParams, queryArray, priceQuery) {
    // console.log(priceQuery, Number.parseInt(reqParams['minprice'], 10), Number.parseInt(reqParams['maxprice'], 10))
    if (priceQuery === 'minprice') {
        if (queryArray.includes('maxprice')) {
            return { $and: [{ 'price': { $gte: Number.parseInt(reqParams['minprice'], 10) } }, { 'price': { $lte: Number.parseInt(reqParams['maxprice'], 10) } }] };
        }
        return { 'price': { $gte: Number.parseInt(reqParams['minprice'], 10) } };
    }
    else if (priceQuery === 'maxprice') {
        if (queryArray.includes('minprice')) {
            return { $and: [{ 'price': { $gte: Number.parseInt(reqParams['minprice'], 10) } }, { 'price': { $lte: Number.parseInt(reqParams['maxprice'], 10) } }] };
        }
        return { 'price': { $lte: Number.parseInt(reqParams['maxprice'], 10) } };
    }
}
// ***************************** public enpoints ***********************************************
// get all properties in quater
PropertyRouter.get('/api/properties-in-quater/:quaterref', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        let filter = { availability: constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE };
        let sorting = { updated: -1 };
        let pageNum = 1;
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            let dateFilter = (0, date_query_setter_1.setDateFilter)((_b = (_a = req.query['startDate']) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '', (_d = (_c = req.query['endDate']) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '');
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) : filter;
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'maxprice' || key === 'minprice') {
                        filter = Object.assign(filter, priceSetter(req.query, queries, key));
                    }
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key], 10);
                    }
                    if (key === 'sorting') {
                        sorting = setSorter(req.query[key]);
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const mainfilter = { $and: [{ 'quater.ref': req.params.quaterref }, filter] };
        // console.log(filter['age'])
        const properties = yield property_1.Property.aggregate([
            {
                $match: mainfilter
            },
            {
                $sort: sorting
            },
            {
                $skip: (pageNum - 1) * pageSize
            },
            {
                $limit: pageSize
            }
        ]);
        const resultCount = yield property_1.Property.countDocuments(mainfilter);
        const totalPages = resultCount > 0 ? Math.ceil(resultCount / pageSize) : 1;
        res.send({ ok: true, data: { properties, currPage: pageNum, totalPages, resultCount } });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while getting all properties in the quater with quaterref: ${req.params.quaterref} and id: ${req.user.id} due to ${(_e = error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get all properties by tag
PropertyRouter.get('/api/properties-by-tag/:code', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h, _j, _k;
    try {
        if (!req.params.code) {
            throw INVALID_REQUEST;
        }
        const tags = yield tag_1.Tag.find({ code: req.params.code });
        const tagRefIds = tags === null || tags === void 0 ? void 0 : tags.map(tag => tag.refId);
        let sorting = { createdAt: -1 };
        let pageNum = 1;
        const queries = Object.keys(req.query);
        let filter = { availability: constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE, _id: { $in: tagRefIds } };
        if (queries.length > 0) {
            let dateFilter = (0, date_query_setter_1.setDateFilter)((_g = (_f = req.query['startDate']) === null || _f === void 0 ? void 0 : _f.toString()) !== null && _g !== void 0 ? _g : '', (_j = (_h = req.query['endDate']) === null || _h === void 0 ? void 0 : _h.toString()) !== null && _j !== void 0 ? _j : '');
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) : filter;
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key], 10);
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        console.log('pageNum: ', pageNum, pageNum - 1, pageSize);
        const properties = yield property_1.Property.aggregate([
            {
                $match: filter
            },
            {
                $sort: sorting
            },
            {
                $skip: (pageNum - 1) * pageSize
            },
            {
                $limit: pageSize
            }
        ]);
        const resultCount = yield property_1.Property.countDocuments(filter);
        const totalPages = resultCount > 0 ? Math.ceil(resultCount / pageSize) : 1;
        res.send({ ok: true, data: { properties, currPage: pageNum, totalPages, resultCount } });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while getting all properties by tag code for the tag with code: ${req.params.code} due to ${(_k = error === null || error === void 0 ? void 0 : error.message) !== null && _k !== void 0 ? _k : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get all landlords properties
PropertyRouter.get('/api/landlord-properties/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m, _o, _p, _q;
    try {
        // console.log(req.params.id)
        let pipeline = [];
        let filter = {
            ownerId: new mongoose_1.Types.ObjectId(req.params.id),
            availability: constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE
        };
        const queries = Object.keys(req.query);
        let pageNum;
        let withPagination = queries === null || queries === void 0 ? void 0 : queries.includes('page');
        if (queries.length > 0) {
            let dateFilter = (0, date_query_setter_1.setDateFilter)((_m = (_l = req.query['startDate']) === null || _l === void 0 ? void 0 : _l.toString()) !== null && _m !== void 0 ? _m : '', (_p = (_o = req.query['endDate']) === null || _o === void 0 ? void 0 : _o.toString()) !== null && _p !== void 0 ? _p : '');
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) : filter;
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key], 10);
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        pipeline.push({
            $match: filter
        });
        if (withPagination && pageNum) {
            pipeline.push({
                $sort: { createdAt: -1 }
            }, {
                $skip: (pageNum - 1) * pageSize
            }, {
                $limit: pageSize
            });
        }
        const properties = yield property_1.Property.aggregate([
            ...pipeline,
            {
                $lookup: {
                    from: "users",
                    localField: "ownerId",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: {
                    path: "$owner",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);
        const resultCount = yield property_1.Property.countDocuments(filter);
        const totalPages = resultCount > 0 ? Math.ceil(resultCount / pageSize) : 1;
        res.send({ ok: true, data: (withPagination && pageNum) ? { properties, currPage: pageNum, totalPages, resultCount } : properties });
    }
    catch (error) {
        // console.log(error)
        logger_1.logger.error(`An Error occured while getting all properties owned by the landlord with id: ${req.params.id} due to ${(_q = error === null || error === void 0 ? void 0 : error.message) !== null && _q !== void 0 ? _q : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// search using quaterref index for property's quater.ref and return various category counts
PropertyRouter.get('/api/search-property-categories/:quaterRef', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _r;
    try {
        const catAggregator = (0, queryMaker_1.categoryAggregator)(req.params.quaterRef);
        const quaters = yield property_1.Property.aggregate(catAggregator);
        res.send({ ok: true, data: quaters });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying the search, categorize and count property catogories for quater with quaterref: ${req.params.quaterRef} due to ${(_r = error === null || error === void 0 ? void 0 : error.message) !== null && _r !== void 0 ? _r : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// search with autocomplete index for quater and return matching quater name & ref
PropertyRouter.get('/api/search-quaters/:quaterRef', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _s;
    try {
        const quaters = yield property_1.Property.aggregate([
            {
                $search: {
                    index: 'autocomplete',
                    autocomplete: {
                        query: req.params.quaterRef,
                        path: 'quater.ref'
                    }
                }
            },
            {
                $match: {
                    "availability": constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE
                }
            },
            {
                $project: {
                    "quater": 1,
                }
            },
            { $group: { _id: '$quater.ref' } },
            { $limit: 10 }
        ]);
        res.send({ ok: true, data: quaters });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while index-searching and group properties by quaterref for the quaterref: ${req.params.quaterRef} due to ${(_s = error === null || error === void 0 ? void 0 : error.message) !== null && _s !== void 0 ? _s : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get properties in a town
PropertyRouter.get('/api/town-properties/:town', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _t, _u, _v, _w, _x;
    try {
        let filter = { availability: constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE };
        let sorting = { createdAt: -1 };
        let pageNum = 1;
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            let dateFilter = (0, date_query_setter_1.setDateFilter)((_u = (_t = req.query['startDate']) === null || _t === void 0 ? void 0 : _t.toString()) !== null && _u !== void 0 ? _u : '', (_w = (_v = req.query['endDate']) === null || _v === void 0 ? void 0 : _v.toString()) !== null && _w !== void 0 ? _w : '');
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) : filter;
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key], 10);
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const mainfilter = { $and: [{ town: { "$regex": req.params.town, $options: 'i' } }, filter] };
        // console.log(mainfilter)
        const properties = yield property_1.Property.aggregate([
            {
                $match: mainfilter
            },
            {
                $sort: sorting
            },
            {
                $skip: (pageNum - 1) * pageSize
            },
            {
                $limit: pageSize
            }
        ]);
        const resultCount = yield property_1.Property.countDocuments(mainfilter);
        const totalPages = resultCount > 0 ? Math.ceil(resultCount / pageSize) : 1;
        res.send({ ok: true, data: { properties, currPage: pageNum, totalPages, resultCount } });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while attempting to get all properties in the town named: ${req.params.town} due to ${(_x = error === null || error === void 0 ? void 0 : error.message) !== null && _x !== void 0 ? _x : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get properties in a district
PropertyRouter.get('/api/district-properties/:districtref', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _y, _z, _0, _1, _2;
    try {
        let filter = { availability: constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE };
        let sorting = { createdAt: -1 };
        let pageNum = 1;
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            let dateFilter = (0, date_query_setter_1.setDateFilter)((_z = (_y = req.query['startDate']) === null || _y === void 0 ? void 0 : _y.toString()) !== null && _z !== void 0 ? _z : '', (_1 = (_0 = req.query['endDate']) === null || _0 === void 0 ? void 0 : _0.toString()) !== null && _1 !== void 0 ? _1 : '');
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) : filter;
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key], 10);
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const mainfilter = { $and: [{ 'district.ref': req.params.districtref }, filter] };
        // console.log(mainfilter)
        const properties = yield property_1.Property.aggregate([
            {
                $match: mainfilter
            },
            {
                $sort: sorting
            },
            {
                $skip: (pageNum - 1) * pageSize
            },
            {
                $limit: pageSize
            }
        ]);
        const resultCount = yield property_1.Property.countDocuments(mainfilter);
        const totalPages = resultCount > 0 ? Math.ceil(resultCount / pageSize) : 1;
        res.send({ ok: true, data: { properties, currPage: pageNum, totalPages, resultCount } });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while attempting to get all properties in the district named: ${req.params.districtref} due to ${(_2 = error === null || error === void 0 ? void 0 : error.message) !== null && _2 !== void 0 ? _2 : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get properties groups by town and their count
PropertyRouter.get('/api/properties-group-by-town', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _3;
    try {
        const groupsByTown = yield property_1.Property.aggregate([
            {
                $match: {
                    'availability': constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE
                }
            },
            {
                $group: {
                    _id: '$town',
                    count: { $count: {} }
                }
            }
        ]);
        res.send({ ok: true, data: groupsByTown });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while grouping  and counting properties by town due to ${(_3 = error === null || error === void 0 ? void 0 : error.message) !== null && _3 !== void 0 ? _3 : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
/**
 * get properties in a town and group them by district ref and their count
 */
PropertyRouter.get('/api/properties-group-by-district', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _4, _5;
    try {
        const pipeline = [
            {
                $match: {
                    'availability': constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE
                }
            },
            {
                $group: {
                    _id: '$district.ref',
                    count: { $count: {} }
                }
            }
        ];
        if (req.query.town) {
            pipeline.unshift({
                $match: {
                    town: (_4 = req.query.town) === null || _4 === void 0 ? void 0 : _4.toString()
                }
            });
        }
        const groupsByDistrictRef = yield property_1.Property.aggregate(pipeline);
        res.send({ ok: true, data: groupsByDistrictRef });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while grouping  and counting properties by town due to ${(_5 = error === null || error === void 0 ? void 0 : error.message) !== null && _5 !== void 0 ? _5 : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get property count for popular towns
PropertyRouter.get('/api/count-properties-per-town', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _6;
    try {
        const towncountlist = yield property_1.Property.aggregate((0, queryMaker_1.townAggregator)());
        res.send({ ok: true, data: towncountlist });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while getting property count for popular towns due to ${(_6 = error === null || error === void 0 ? void 0 : error.message) !== null && _6 !== void 0 ? _6 : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get single properties by id
PropertyRouter.get('/api/properties/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _7;
    try {
        const pipeline = [
            {
                $match: {
                    _id: new mongoose_1.Types.ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'ownerId',
                    foreignField: '_id',
                    as: "owner"
                }
            },
            {
                $unwind: {
                    path: '$owner',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'tags',
                    localField: '_id',
                    foreignField: 'refId',
                    as: "tags"
                }
            }
        ];
        const properties = yield property_1.Property.aggregate(pipeline);
        if (!properties[0]) {
            throw NOT_FOUND;
        }
        res.send({ ok: true, data: properties[0] });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while getting the details of the property with id: ${req.params.id} due to ${(_7 = error === null || error === void 0 ? void 0 : error.message) !== null && _7 !== void 0 ? _7 : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get properties in same quater (Related prperties in same quater)
PropertyRouter.get('/api/property/:propertyId/related-properties/:quaterref', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _8;
    try {
        let relatedProperties;
        let relationship = 'Quater';
        const aggregator = (_code) => [
            {
                $match: {
                    code: _code
                }
            },
            {
                $lookup: {
                    from: "properties",
                    localField: "refId",
                    foreignField: "_id",
                    as: 'relatedProp'
                }
            },
            {
                $unwind: {
                    path: "$relatedProp",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "relatedProp.availability": "Available",
                    "relatedProp._id": { $ne: new mongoose_1.Types.ObjectId(req.params.propertyId) }
                }
            },
            {
                $limit: 4
            },
            {
                $project: {
                    relatedProp: 1
                }
            }
        ];
        const propertiesInSameQuater = yield property_1.Property.find({
            $and: [
                { availability: constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE },
                { 'quater.ref': req.params.quaterref },
                { _id: { $ne: req.params.propertyId } }
            ]
        })
            .limit(4);
        // console.log(propertiesInSameQuater.map(p => p._id.toString()), '\n\n req.params.propertyId:   ', req.params.propertyId)
        if (propertiesInSameQuater && (propertiesInSameQuater.length > 0)) {
            relatedProperties = propertiesInSameQuater.filter(prop => prop._id.toString() !== req.params.propertyId);
        }
        // check if the previous query result is empty
        else {
            let result = [];
            // get a list of all tags for this property
            const propertyTags = yield tag_1.Tag.find({ refId: new mongoose_1.Types.ObjectId(req.params.propertyId) });
            // check if there are tags on the concern property
            if (propertyTags && propertyTags.length > 0) {
                for (let tag of propertyTags) {
                    // get all similar tags and lookup to get their corresponding linked (by refId) property
                    const sameCodeTags = yield tag_1.Tag.aggregate(aggregator(tag.code));
                    if ((sameCodeTags === null || sameCodeTags === void 0 ? void 0 : sameCodeTags.length) > 0) {
                        result.push(...sameCodeTags);
                    }
                }
            }
            relatedProperties = result === null || result === void 0 ? void 0 : result.map(item => item === null || item === void 0 ? void 0 : item.relatedProp);
            relationship = result.length > 0 ? 'Tag' : relationship;
        }
        res.send({ ok: true, data: { relatedProperties, relationship } });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while getting related properties (related by quater, or tag code) for the property with id: ${req.params.propertyId} in quater with quaterref: ${req.params.quaterref} due to ${(_8 = error === null || error === void 0 ? void 0 : error.message) !== null && _8 !== void 0 ? _8 : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// ***************************** Tenant Only endpoints ***********************************************
// ***************************** admin endpoints ***********************************************
// get all properties by admin
PropertyRouter.get('/api/properties', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _9, _10, _11, _12, _13;
    try {
        let filter = {};
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            let dateFilter = (0, date_query_setter_1.setDateFilter)((_10 = (_9 = req.query['startDate']) === null || _9 === void 0 ? void 0 : _9.toString()) !== null && _10 !== void 0 ? _10 : '', (_12 = (_11 = req.query['endDate']) === null || _11 === void 0 ? void 0 : _11.toString()) !== null && _12 !== void 0 ? _12 : '');
            filter = Object.keys(dateFilter).length > 0 ? Object.assign(filter, dateFilter) : filter;
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const pipeline = [
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "users",
                    localField: "ownerId",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: {
                    path: "$owner",
                    preserveNullAndEmptyArrays: true
                }
            }
        ];
        if (queries.includes('ownerId') && req.query['ownerId']) {
            pipeline.push({
                $match: {
                    'owner.unique_id': Number(req.query['ownerId'])
                }
            });
        }
        console.log(pipeline);
        const properties = yield property_1.Property.aggregate(pipeline);
        res.send({ ok: true, data: properties });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while getting all properties by admin due to ${(_13 = error === null || error === void 0 ? void 0 : error.message) !== null && _13 !== void 0 ? _13 : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// create new property
PropertyRouter.post('/api/properties', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _14;
    try {
        const newProperty = new property_1.Property(Object.assign(Object.assign({}, req.body), { ownerId: new mongoose_1.Types.ObjectId(req.body.ownerId) }));
        const property = yield newProperty.save();
        res.status(201).send({ ok: true, data: property });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while creating a new property due to ${(_14 = error === null || error === void 0 ? void 0 : error.message) !== null && _14 !== void 0 ? _14 : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// update property availability status
PropertyRouter.patch('/api/properties/:id/availability/update', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _15;
    try {
        let propertyOwner;
        // make sure an availability status was passed within the request body
        if (!req.body.availability) {
            throw INVALID_REQUEST;
        }
        // check if user is landlord or admin and property belongs to that user(landlord)
        if (req.user.role !== 'ADMIN' && req.user.role !== 'LANDLORD') {
            throw NOT_AUTHORIZED;
        }
        const property = yield property_1.Property.findById(req.params.id);
        if (!property) {
            throw NOT_FOUND;
        }
        if (req.user.role === 'LANDLORD') {
            if (property.ownerId.toString() !== req.user.id) {
                throw NOT_PROPERTY_OWNER;
            }
            propertyOwner = req.user;
        }
        if (req.user.role === 'ADMIN') {
            propertyOwner = yield user_1.User.findById(property.ownerId);
        }
        // update property availability
        property.availability = req.body.availability;
        property.updated = Date.now();
        const updatedProperty = yield property.save();
        if (!updatedProperty) {
            throw SAVE_OPERATION_FAILED;
        }
        // notify the property owner
        const { subject, heading, detail, linkText } = (0, mailer_templates_1.notifyPropertyAvailability)(req.user.email, property._id.toString(), req.body.availability);
        const link = `${process.env.CLIENT_URL}/${propertyOwner.role === 'ADMIN' ? 'dashboard' : 'profile'}`;
        const success = yield (0, mailer_1.mailer)(propertyOwner.email, subject, heading, detail, link, linkText);
        res.status(200).send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while updating the availability status of the property with id : ${req.params.id}  due to ${(_15 = error === null || error === void 0 ? void 0 : error.message) !== null && _15 !== void 0 ? _15 : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// update property
PropertyRouter.patch('/api/properties/:id/update', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _16;
    try {
        const update = {};
        Object.keys(req.body).forEach(key => {
            update[key] = req.body[key];
        });
        if (Object.keys(update).length > 0) {
            update.updated = Date.now();
        }
        const updatedProperty = yield property_1.Property.findByIdAndUpdate(req.params.id, { $set: update }, { runValidators: true });
        if (!updatedProperty) {
            throw SAVE_OPERATION_FAILED;
        }
        res.status(200).send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while updating the property with id : ${req.params.id}  due to ${(_16 = error === null || error === void 0 ? void 0 : error.message) !== null && _16 !== void 0 ? _16 : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// update property media
PropertyRouter.patch('/api/properties/:id/update-media', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _17;
    try {
        const { photos, videos, virtualTours } = req.body.media;
        const property = yield property_1.Property.findById(req.params.id);
        if (!property) {
            throw NOT_FOUND;
        }
        property.media.photos = photos ? photos : property.media.photos;
        property.media.videos = videos ? videos : property.media.videos;
        property.media.virtualTours = virtualTours ? virtualTours : property.media.virtualTours;
        const updatedProperty = yield property.save();
        res.status(200).send({ ok: true, data: updatedProperty });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while updating the media contents of the property with id : ${req.params.id}  due to ${(_17 = error === null || error === void 0 ? void 0 : error.message) !== null && _17 !== void 0 ? _17 : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// delete property
PropertyRouter.delete('/api/properties/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _18, _19;
    try {
        const deletedproperty = yield property_1.Property.findByIdAndDelete(req.params.id);
        if (!deletedproperty) {
            throw DELETE_OPERATION_FAILED;
        }
        // delete all corresponding tags
        yield tag_1.Tag.deleteMany({ refId: deletedproperty._id });
        // delete the related featuring if any
        const relatedFeaturing = yield featured_properties_1.FeaturedProperties.findById(deletedproperty._id);
        if (relatedFeaturing) {
            yield featured_properties_1.FeaturedProperties.findByIdAndDelete(relatedFeaturing._id);
        }
        // delete related reviews
        yield review_1.Review.deleteMany({
            $and: [
                { type: 'Property' },
                { refId: deletedproperty._id.toString() }
            ]
        });
        // delete related complains
        yield complain_1.Complain.deleteMany({
            $and: [
                { type: 'PROPERTY' },
                { targetId: deletedproperty._id }
            ]
        });
        // delete related likes
        yield like_1.Like.deleteMany({
            _id: {
                $in: (_18 = deletedproperty.likes) === null || _18 === void 0 ? void 0 : _18.map(id => new mongoose_1.Types.ObjectId(id))
            }
        });
        // delete rentIntensions
        // coming up
        res.status(201).send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while attempting to delete the property with id : ${req.params.id}  due to ${(_19 = error === null || error === void 0 ? void 0 : error.message) !== null && _19 !== void 0 ? _19 : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=property.js.map