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
exports.ReviewRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth-middleware");
const error_1 = require("../constants/error");
const mongoose_1 = require("mongoose");
const review_1 = require("../models/review");
const ReviewRouter = express_1.default.Router();
exports.ReviewRouter = ReviewRouter;
/**
 * Get review search query filter
 * @Method Review
 * @param {string} key
 * @returns {any} any
 */
function setFilter(key, value) {
    switch (key) {
        case 'type':
            return { 'type': value };
        case 'rating':
            return { 'rating': value };
        case 'status':
            return { 'status': value };
        case 'author':
            return { 'author': value };
        case 'authorType':
            return { 'authorType': value };
        case 'refId':
            return { 'refId': value };
        default:
            return {};
    }
}
// ***************************** public enpoints ***********************************************
// create a new review
ReviewRouter.post('/api/reviews/create', auth_middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type, rating, comment, refId, status } = req.body;
        const author = new mongoose_1.Types.ObjectId(req.user.id);
        const authorType = req.user.role;
        const existAlready = yield review_1.Review.findOne({ $and: [{ type }, { author }, { refId }] });
        if (existAlready) {
            throw error_1.REVIEW_ALREADY_EXIST;
        }
        const newReview = new review_1.Review({
            type, rating, comment, status, author, refId, authorType
        });
        const review = yield newReview.save();
        if (!review) {
            throw error_1.SAVE_OPERATION_FAILED;
        }
        res.send({ ok: true, data: review });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
    }
}));
// get all reviews (with or without query string)
ReviewRouter.get('/api/reviews', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const reviews = yield review_1.Review.find(filter).sort({ createdAt: -1 }).populate('author', ['fullname', 'avatar', 'address.town']).exec();
        res.send({ ok: true, data: reviews });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// get a single review by id
ReviewRouter.get('/api/reviews/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const review = yield review_1.Review.findById(req.params.id).populate('author', ['fullname', 'avatar', 'address.town']).exec();
        if (!review) {
            throw error_1.NOT_FOUND;
        }
        res.send({ ok: true, data: review });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
    }
}));
// ***************************** admin enpoints ***********************************************
// update review's status
ReviewRouter.patch('/api/reviews/:id/status-update', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        if (req.body.status) {
            const review = yield review_1.Review.findById(req.params.id);
            if (!review) {
                throw error_1.NOT_FOUND;
            }
            review.status = req.body.status;
            const updatedReview = yield review.save();
            if (!updatedReview) {
                throw error_1.SAVE_OPERATION_FAILED;
            }
            res.send({ ok: true, data: updatedReview });
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
// delete a review by id
ReviewRouter.delete('/api/reviews/:id/delete', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const review = yield review_1.Review.findByIdAndDelete(req.params.id);
        if (!review) {
            throw error_1.DELETE_OPERATION_FAILED;
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error === null || error === void 0 ? void 0 : error.message, code: (_e = error.code) !== null && _e !== void 0 ? _e : 1000 });
    }
}));
//# sourceMappingURL=review.js.map