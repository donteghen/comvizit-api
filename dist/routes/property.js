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
const property_1 = require("../models/property");
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const queryMaker_1 = require("../utils/queryMaker");
const auth_middleware_1 = require("../middleware/auth-middleware");
const error_1 = require("../constants/error");
const mailer_templates_1 = require("../utils/mailer-templates");
const mailer_1 = require("../helper/mailer");
const user_1 = require("../models/user");
const tag_1 = require("../models/tag");
const PropertyRouter = express_1.default.Router();
exports.PropertyRouter = PropertyRouter;
const pageSize = 24; // number of documents returned per request for the get all properties route
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'ownerId':
            return { 'ownerId': new mongoose_1.Types.ObjectId(value) };
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
    var _a;
    try {
        let filter = { availability: 'Available' };
        let sorting = { updated: -1 };
        let pageNum = 1;
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
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
        const totalPages = Math.ceil(resultCount / pageSize);
        res.send({ ok: true, data: { properties, currPage: pageNum, totalPages, resultCount } });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
    }
}));
// get all properties
PropertyRouter.get('/api/properties', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // console.log(req.query, filter)
        const properties = yield property_1.Property.aggregate([
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
                $unwind: "$owner"
            }
        ]);
        res.send({ ok: true, data: properties });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// get all landlords properties
PropertyRouter.get('/api/landlord-properties', auth_middleware_1.isLoggedIn, auth_middleware_1.isLandlord, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        let filter = { ownerId: new mongoose_1.Types.ObjectId(req.user.id) };
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
        const properties = yield property_1.Property.aggregate([
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
                $unwind: "$owner"
            }
        ]);
        res.send({ ok: true, data: properties });
    }
    catch (error) {
        console.log(error);
        res.status(400).send({ ok: false, error: error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
    }
}));
// search using quaterref index for property's quater.ref and return various category counts
PropertyRouter.get('/api/search-property-categories/:quaterRef', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const catAggregator = (0, queryMaker_1.categoryAggregator)(req.params.quaterRef);
        const quaters = yield property_1.Property.aggregate(catAggregator);
        res.send({ ok: true, data: quaters });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
// search with autocomplete index for quater and return matching quater name & ref
PropertyRouter.get('/api/search-quaters/:quaterRef', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
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
                    "availability": "Available"
                }
            },
            {
                $project: {
                    "quater": 1,
                }
            },
            { $group: { _id: '$quater' } },
            { $limit: 10 }
        ]);
        res.send({ ok: true, data: quaters });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_e = error.code) !== null && _e !== void 0 ? _e : 1000 });
    }
}));
// get properties in a town
PropertyRouter.get('/api/town-properties/:town', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        let filter = { availability: 'Available' };
        let sorting = { createdAt: -1 };
        let pageNum = 1;
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
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
        const totalPages = Math.ceil(resultCount / pageSize);
        res.send({ ok: true, data: { properties, currPage: pageNum, totalPages, resultCount } });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_f = error.code) !== null && _f !== void 0 ? _f : 1000 });
    }
}));
// get properties in a district
PropertyRouter.get('/api/district-properties/:districtref', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        let filter = { availability: 'Available' };
        let sorting = { createdAt: -1 };
        let pageNum = 1;
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
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
        const totalPages = Math.ceil(resultCount / pageSize);
        res.send({ ok: true, data: { properties, currPage: pageNum, totalPages, resultCount } });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_g = error.code) !== null && _g !== void 0 ? _g : 1000 });
    }
}));
// get properties groups by town and their count
PropertyRouter.get('/api/properties-group-by-town', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        const groupsByTown = yield property_1.Property.aggregate([
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
        res.status(400).send({ ok: false, error: error.message, code: (_h = error.code) !== null && _h !== void 0 ? _h : 1000 });
    }
}));
/**
 * get properties in a town and  groups by district ref and their count
 */
PropertyRouter.get('/api/properties-group-by-district', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
    try {
        const pipeline = [
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
                    town: (_j = req.query.town) === null || _j === void 0 ? void 0 : _j.toString()
                }
            });
        }
        const groupsByDistrictRef = yield property_1.Property.aggregate(pipeline);
        res.send({ ok: true, data: groupsByDistrictRef });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_k = error.code) !== null && _k !== void 0 ? _k : 1000 });
    }
}));
// get property count for popular towns
PropertyRouter.get('/api/count-properties-per-town', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    try {
        const towncountlist = yield property_1.Property.aggregate((0, queryMaker_1.townAggregator)());
        res.send({ ok: true, data: towncountlist });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_l = error.code) !== null && _l !== void 0 ? _l : 1000 });
    }
}));
// get single properties by id
PropertyRouter.get('/api/properties/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _m;
    try {
        const property = yield property_1.Property.findById(req.params.id).populate('ownerId');
        if (!property) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: property });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_m = error.code) !== null && _m !== void 0 ? _m : 1000 });
    }
}));
// get properties in same quater (Related prperties in same quater)
PropertyRouter.get('/api/property/:propertyId/related-properties/:quaterref', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _o;
    try {
        const relatedProperties = yield property_1.Property.find({
            $and: [
                { 'quater.ref': req.params.quaterref },
                { _id: { $ne: req.params.propertyId } }
            ]
        })
            .limit(4);
        res.send({ ok: true, data: relatedProperties });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_o = error.code) !== null && _o !== void 0 ? _o : 1000 });
    }
}));
// ***************************** Tenant Only endpoints ***********************************************
// get a tenant's favorite property list
PropertyRouter.get('/api/fav-property-list', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _p;
    try {
        let properties = [];
        const favIdList = req.user.favorites;
        if (favIdList && favIdList.length > 0) {
            properties = yield property_1.Property.aggregate([
                {
                    $match: {
                        availability: 'Available',
                        _id: { $in: favIdList.map(id => new mongoose_1.Types.ObjectId(id)) }
                    }
                }
            ]);
        }
        res.send({ ok: true, data: properties });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_p = error.code) !== null && _p !== void 0 ? _p : 1000 });
    }
}));
// Add a property to tenant's favorite property list
PropertyRouter.patch('/api/fav-property-list/add-favorite', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q;
    try {
        const propertyId = req.body.id;
        const user = yield user_1.User.findById(req.user.id);
        let userFavList = user.favorites;
        if (propertyId) {
            if (!userFavList.includes(propertyId)) {
                userFavList = userFavList.concat(propertyId);
                user.favorites = userFavList;
                yield user.save();
            }
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_q = error.code) !== null && _q !== void 0 ? _q : 1000 });
    }
}));
// Remove a property from tenant's favorite property list
PropertyRouter.patch('/api/fav-property-list/remove-favorite', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _r;
    try {
        let userFavList = req.user.favorites;
        const propertyId = req.body.id;
        const user = yield user_1.User.findById(req.user.id);
        if (propertyId && (userFavList === null || userFavList === void 0 ? void 0 : userFavList.length) > 0) {
            userFavList = userFavList.filter(id => id !== propertyId);
        }
        user.favorites = userFavList;
        const updatedUser = yield user.save();
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_r = error.code) !== null && _r !== void 0 ? _r : 1000 });
    }
}));
// Clear tenant's favorite property list
PropertyRouter.patch('/api/fav-property-list/clear-favorite-list', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _s;
    try {
        let userFavList = req.user.favorites;
        const propertyId = req.body.id;
        const user = yield user_1.User.findById(req.user.id);
        user.favorites = [];
        const updatedUser = yield user.save();
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_s = error.code) !== null && _s !== void 0 ? _s : 1000 });
    }
}));
// ***************************** Restricted endpoints ***********************************************
// create new property
PropertyRouter.post('/api/properties', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _t;
    try {
        const newProperty = new property_1.Property(Object.assign(Object.assign({}, req.body), { ownerId: new mongoose_1.Types.ObjectId(req.body.ownerId) }));
        const property = yield newProperty.save();
        res.status(201).send({ ok: true, data: property });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_t = error.code) !== null && _t !== void 0 ? _t : 1000 });
    }
}));
// update property availability status
PropertyRouter.patch('/api/properties/:id/availability/update', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _u;
    try {
        let propertyOwner;
        // check if user is landlord or admin and property belongs to that user(landlord)
        if (req.user.role !== 'ADMIN' && req.user.role !== 'LANDLORD') {
            throw error_1.NOT_AUTHORIZED;
        }
        const property = yield property_1.Property.findById(req.params.id);
        if (!property) {
            throw error_1.NOT_FOUND;
        }
        if (req.user.role === 'LANDLORD') {
            if (property.ownerId.toString() !== req.user.id) {
                throw error_1.NOT_PROPERTY_OWNER;
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
            throw error_1.SAVE_OPERATION_FAILED;
        }
        // notify the property owner
        const { subject, heading, detail, linkText } = (0, mailer_templates_1.notifyPropertyAvailability)(req.user.email, property._id.toString(), req.body.availability);
        const link = `${process.env.CLIENT_URL}/${propertyOwner.role === 'ADMIN' ? 'dashboard' : 'profile'}`;
        const success = yield (0, mailer_1.mailer)(propertyOwner.email, subject, heading, detail, link, linkText);
        res.status(200).send({ ok: true });
    }
    catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_u = error.code) !== null && _u !== void 0 ? _u : 1000 });
    }
}));
// update property
PropertyRouter.patch('/api/properties/:id/update', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _v;
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
            throw error_1.SAVE_OPERATION_FAILED;
        }
        res.status(200).send({ ok: true });
    }
    catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_v = error.code) !== null && _v !== void 0 ? _v : 1000 });
    }
}));
// update property media
PropertyRouter.patch('/api/properties/:id/update-media', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _w;
    try {
        const { photos, videos, virtualTours } = req.body.media;
        const property = yield property_1.Property.findById(req.params.id);
        if (!property) {
            throw error_1.NOT_FOUND;
        }
        property.media.photos = photos ? photos : property.media.photos;
        property.media.videos = videos ? videos : property.media.videos;
        property.media.virtualTours = virtualTours ? virtualTours : property.media.virtualTours;
        const updatedProperty = yield property.save();
        res.status(200).send({ ok: true, data: updatedProperty });
    }
    catch (error) {
        // console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_w = error.code) !== null && _w !== void 0 ? _w : 1000 });
    }
}));
// delete property
PropertyRouter.delete('/api/properties/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _x;
    try {
        const deletedproperty = yield property_1.Property.findByIdAndDelete(req.params.id);
        if (!deletedproperty) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        // delete all corresponding tags
        yield tag_1.Tag.deleteMany({ refId: deletedproperty._id });
        res.status(201).send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_x = error.code) !== null && _x !== void 0 ? _x : 1000 });
    }
}));
//# sourceMappingURL=property.js.map