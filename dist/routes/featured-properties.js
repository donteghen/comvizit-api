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
const auth_middleware_1 = require("../middleware/auth-middleware");
const featured_properties_1 = require("../models/featured-properties");
const property_1 = require("../models/property");
const logger_1 = require("../logs/logger");
const date_query_setter_1 = require("../utils/date-query-setter");
const constants_1 = require("../constants");
const { DELETE_OPERATION_FAILED, FEATURING_EXPIRED, INVALID_PROPERTY_ID_FOR_FEATURING, INVALID_REQUEST, NOT_FOUND, PROPERTY_IS_ALREADY_FEATURED, PROPERTY_UNAVAILABLE_FOR_FEATURING } = constants_1.errors;
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
        case 'unique_id':
            return { unique_id: Number(value) };
        case 'status':
            return { 'status': value };
        default:
            return {};
    }
}
const pageSize = Number(process.env.PAGE_SIZE); // number of documents returned per request for the get all properties route
// ***************************** public enpoints ***********************************************
// get all featured properties (with or without query string)
FeaturedRouter.get('/api/featured/properties-active', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let matchFilter = { status: 'Active' };
        // let sorting:any = {createdAt: -1}
        let pageNum = 1;
        const sortPipelineStage = { $sort: { createAt: -1 } };
        const pipeline = [];
        let subpipeline = [
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "property"
                }
            },
            {
                $unwind: {
                    path: "$property",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    'property.availability': 'Available'
                }
            }
        ];
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                var _a, _b, _c, _d;
                let dateFilter = (0, date_query_setter_1.setDateFilter)((_b = (_a = req.query['startDate']) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '', (_d = (_c = req.query['endDate']) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '');
                matchFilter = Object.keys(dateFilter).length > 0 ? Object.assign(matchFilter, dateFilter) : matchFilter;
                if (key === 'page') {
                    pageNum = Number.parseInt(req.query[key], 10);
                }
                if (key === 'quaterref' && req.query[key] !== undefined && req.query[key] !== null) {
                    subpipeline.push({
                        $match: {
                            "property.quater.ref": req.query[key]
                        }
                    });
                }
                if (key === 'districtref' && req.query[key] !== undefined && req.query[key] !== null) {
                    subpipeline.push({
                        $match: {
                            "property.district.ref": req.query[key]
                        }
                    });
                }
                if (key === 'town' && req.query[key] !== undefined && req.query[key] !== null) {
                    subpipeline.push({
                        $match: {
                            "property.town": req.query[key]
                        }
                    });
                }
                if (req.query[key]) {
                    matchFilter = Object.assign(matchFilter, setFilter(key, req.query[key]));
                }
            });
        }
        if (Object.keys(matchFilter).length > 0) {
            pipeline.push({ $match: matchFilter });
        }
        if (subpipeline) {
            pipeline.push(...subpipeline);
        }
        pipeline.push(sortPipelineStage);
        if (req.query.pageView) {
            pipeline.push(...[
                {
                    $skip: (pageNum - 1) * pageSize
                },
                {
                    $limit: pageSize
                }
            ]);
        }
        const resultCount = yield featured_properties_1.FeaturedProperties.countDocuments(matchFilter);
        const totalPages = resultCount > 0 ? Math.ceil(resultCount / pageSize) : 1;
        const featuredProperties = yield featured_properties_1.FeaturedProperties.aggregate(pipeline);
        if (req.query.pageView) {
            return res.send({ ok: true, data: { featuredProperties, currPage: pageNum, totalPages, resultCount } });
        }
        // console.log(req.query, req.body, featuredProperties)
        res.send({ ok: true, data: featuredProperties });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying active featured properties due to ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get a singlefeatured property by Id
FeaturedRouter.get('/api/featured/properties/:propertyId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const featuredProperty = yield featured_properties_1.FeaturedProperties.findById(req.params.propertyId);
        if (!featuredProperty) {
            throw NOT_FOUND;
        }
        res.send({ ok: true, data: featuredProperty });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying the property featuring details with id: ${req.params.propertyId} due to ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// create new featured property
FeaturedRouter.post('/api/featured/properties/create', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { propertyId, duration } = req.body;
        const relatedProperty = yield property_1.Property.findById(propertyId);
        if (!relatedProperty) {
            throw INVALID_PROPERTY_ID_FOR_FEATURING;
        }
        if (relatedProperty.availability === 'Taken' || relatedProperty.availability === 'Inactive') {
            throw PROPERTY_UNAVAILABLE_FOR_FEATURING;
        }
        const AlreadyFeatured = yield featured_properties_1.FeaturedProperties.findOne({ propertyId });
        if (AlreadyFeatured) {
            throw PROPERTY_IS_ALREADY_FEATURED;
        }
        const newFeaturedProperty = new featured_properties_1.FeaturedProperties({
            propertyId,
            duration: Number(duration)
        });
        const featuredProperty = yield newFeaturedProperty.save();
        // update that concerned property's featuring status to true
        relatedProperty.featuring = true;
        yield relatedProperty.save();
        res.send({ ok: true, data: featuredProperty });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while creating a new property featring for property : ${req.body.propertyId} due to ${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// update featured property's status
FeaturedRouter.patch('/api/featured/properties/:propertyId/status/update', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        if (req.body.status) {
            const featuredProperty = yield featured_properties_1.FeaturedProperties.findById(req.params.propertyId);
            if (!featuredProperty) {
                throw NOT_FOUND;
            }
            if (Date.now() > (featuredProperty.startedAt + featuredProperty.duration)) {
                throw FEATURING_EXPIRED;
            }
            featuredProperty.status = req.body.status;
            const updateFeaturedProperty = yield featuredProperty.save();
            // update related property's featuring state
            const relatedProperty = yield property_1.Property.findById(featuredProperty.propertyId);
            relatedProperty.featuring = updateFeaturedProperty.status === constants_1.constants.FEATURED_PROPERTY_STATUS.ACTIVE ? true : false;
            yield relatedProperty.save();
            res.send({ ok: true, data: updateFeaturedProperty });
        }
        else {
            throw INVALID_REQUEST;
        }
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while updating a property featring with id: ${req.params.propertyId} due to${(_d = error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : 'Unknown Source'}`);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error });
    }
}));
// delete a featured property by id
FeaturedRouter.delete('/api/featured/properties/:propertyId/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const featuredProperty = yield featured_properties_1.FeaturedProperties.findByIdAndDelete(req.params.propertyId);
        if (!featuredProperty) {
            throw DELETE_OPERATION_FAILED;
        }
        // update related property's featuring state
        const relatedProperty = yield property_1.Property.findById(featuredProperty.propertyId);
        relatedProperty.featuring = false;
        yield relatedProperty.save();
        res.send({ ok: true });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while deleting a property featring with id: ${req.params.propertyId} due to${(_e = error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
// get all featured properties (with or without query string)
FeaturedRouter.get('/api/featured/properties', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        let matchFilter = {};
        const pipeline = [{ $sort: { createAt: -1 } }];
        let subpipeline = [
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "property"
                }
            },
            {
                $unwind: {
                    path: "$property",
                    preserveNullAndEmptyArrays: true
                }
            },
        ];
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (key === 'propertyId' && req.query[key]) {
                    subpipeline.push({
                        $match: {
                            "property.unique_id": Number(req.query[key])
                        }
                    });
                }
                if (key === 'quaterref' && req.query[key] !== undefined && req.query[key] !== null) {
                    subpipeline.push({
                        $match: {
                            "property.quater.ref": req.query[key]
                        }
                    });
                }
                if (req.query[key]) {
                    matchFilter = Object.assign(matchFilter, setFilter(key, req.query[key]));
                }
            });
        }
        if (Object.keys(matchFilter).length > 0) {
            pipeline.push({ $match: matchFilter });
        }
        if (subpipeline) {
            pipeline.push(...subpipeline);
        }
        // console.log(pipeline)
        const featuredProperties = yield featured_properties_1.FeaturedProperties.aggregate(pipeline);
        res.send({ ok: true, data: featuredProperties });
    }
    catch (error) {
        logger_1.logger.error(`An Error occured while querying all featured properties by an admin due to ${(_f = error === null || error === void 0 ? void 0 : error.message) !== null && _f !== void 0 ? _f : 'Unknown Source'}`);
        res.status(400).send({ ok: false, error });
    }
}));
//# sourceMappingURL=featured-properties.js.map