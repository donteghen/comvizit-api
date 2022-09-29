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
const middleware_1 = __importDefault(require("../middleware"));
const PropertyRouter = express_1.default.Router();
exports.PropertyRouter = PropertyRouter;
const pageSize = 24; // number of documents returned per request for the get all properties route
// query helper function
function setFilter(key, value) {
    switch (key) {
        case 'ownerId':
            return { 'ownerId': value.toString() };
        case 'ownerId':
            return { 'ownerId': { "$regex": value, $options: 'i' } };
        case 'maxprice':
            return { 'price': { $lte: Number.parseInt(value, 10) } };
        case 'minprice':
            return { 'price': { $gte: Number.parseInt(value, 10) } };
        case 'bedroomCount':
            return { 'bedroomCount': value };
        case 'propertyType':
            return { 'propertyType': value };
        case 'propertSize':
            return { 'propertSize': { $gte: Number.parseInt(value, 10) } };
        case 'distanceFromRoad':
            return { 'distanceFromRoad': { $lte: Number.parseInt(value, 10) } };
        case 'costFromRoad':
            return { 'costFromRoad': { $lte: Number.parseInt(value, 10) } };
        case 'furnishedState':
            return { 'furnishedState': value };
        case 'amenities':
            return { 'amenities': { $in: value } };
        case 'facilities':
            return { 'facilities': { $in: value } };
        case 'amenities':
            return { 'amenities': { $in: value } };
        case 'preferedTenant':
            return { 'preferedTenant': value };
        default:
            return {};
    }
}
function setSorter(key, value) {
    switch (key) {
        case 'HighToLow':
            return { 'price': -1 };
        case 'LowToHigh':
            return { 'price': 1 };
        case 'MostRecent':
            return { 'updated': -1 };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// get all properties
PropertyRouter.get('/api/properties', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let filter = {};
        let sorting = {};
        let pageNum = 1;
        const queries = Object.keys(req.query);
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    if (key === 'sorting') {
                        sorting = Object.assign(sorting, setSorter(key, req.query[key]));
                    }
                    if (key === 'page') {
                        pageNum = Number.parseInt(req.query[key], 10);
                    }
                    filter = Object.assign(filter, setFilter(key, req.query[key]));
                }
            });
        }
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
                $limit: pageNum
            }
        ]);
        const resultCount = yield property_1.Property.countDocuments(filter);
        const totalPages = Math.floor(resultCount / pageSize);
        res.send({ ok: true, data: { properties, currPage: pageNum, totalPages } });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// get single properties by id
PropertyRouter.get('/api/properties/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const property = yield property_1.Property.findById(req.params.id);
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
PropertyRouter.get('/api/property/related-properties', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const relatedProperties = yield property_1.Property.find({ quater: req.body.quater }).limit(4);
        res.send({ ok: true, data: relatedProperties });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// ***************************** admin restricted endpoints ***********************************************
// create new property
PropertyRouter.patch('/api/properties', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
PropertyRouter.patch('/api/properties/:id', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = {};
        Object.keys(req.body).forEach(key => {
            update[key] = req.body[key];
        });
        if (Object.keys(update).length > 0) {
            update.updated = Date.now();
        }
        const updatedProperty = yield property_1.Property.findByIdAndUpdate(req.params.id, { $set: update });
        if (!updatedProperty) {
            throw new Error('Update requested failed!');
        }
        res.status(201).send({ ok: true, data: updatedProperty });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message });
    }
}));
// delete property
PropertyRouter.delete('/api/properties/:id', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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