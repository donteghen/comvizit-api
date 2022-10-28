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
const PropertyRouter = express_1.default.Router();
exports.PropertyRouter = PropertyRouter;
const pageSize = 24; // number of documents returned per request for the get all properties route
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'ownerId':
            return { 'ownerId': new mongoose_1.Types.ObjectId(value) };
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
        // case 'districtref':
        //     return {'district.ref': value}
        // case 'quaterref':
        //     return {'quater.ref': value}
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
// get all properties
PropertyRouter.get('/api/properties-in-quater/:quaterref', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get all properties
PropertyRouter.get('/api/properties', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const properties = yield property_1.Property.find(filter).populate('ownerId').exec();
        res.send({ ok: true, data: properties });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// search using quaterref index for property's quater.ref and return various category counts
PropertyRouter.get('/api/search-property-categories/:quaterRef', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const catAggregator = (0, queryMaker_1.categoryAggregator)(req.params.quaterRef);
        const quaters = yield property_1.Property.aggregate(catAggregator);
        res.send({ ok: true, data: quaters });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// search with autocomplete index for quater and return matching quater name & ref
PropertyRouter.get('/api/search-quaters/:quaterRef', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get property count for popular towns
PropertyRouter.get('/api/count-properties-per-town', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const towncountlist = yield property_1.Property.aggregate((0, queryMaker_1.townAggregator)());
        res.send({ ok: true, data: towncountlist });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get single properties by id
PropertyRouter.get('/api/properties/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const property = yield property_1.Property.findById(req.params.id).populate('ownerId').exec();
        if (!property) {
            throw new Error('Property not found!');
        }
        res.send({ ok: true, data: property });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get properties in same quater
PropertyRouter.get('/api/property/:propertyId/related-properties/:quaterref', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// create new property
PropertyRouter.post('/api/properties', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newProperty = new property_1.Property(Object.assign({}, req.body));
        const property = yield newProperty.save();
        res.status(201).send({ ok: true, data: property });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// update property
PropertyRouter.patch('/api/properties/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            throw new Error('Update requested failed!');
        }
        res.status(200).send({ ok: true });
    }
    catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// update property media
PropertyRouter.patch('/api/properties/:id/update-media', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { photos, videos, virtualTours } = req.body.media;
        const property = yield property_1.Property.findById(req.params.id);
        if (!property) {
            throw new Error('Request property not found!');
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
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// delete property
PropertyRouter.delete('/api/properties/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedproperty = yield property_1.Property.findByIdAndDelete(req.params.id);
        if (!deletedproperty) {
            throw new Error('Property deletion failed!');
        }
        res.status(201).send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
//# sourceMappingURL=property.js.map