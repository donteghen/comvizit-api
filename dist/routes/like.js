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
exports.LikeRouter = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const property_1 = require("../models/property");
const user_1 = require("../models/user");
const error_1 = require("../constants/error");
const auth_middleware_1 = require("../middleware/auth-middleware");
const like_1 = require("../models/like");
const LikeRouter = express_1.default.Router();
exports.LikeRouter = LikeRouter;
// query helper function
// function setFilter(key:string, value:any): any {
//     switch (key) {
//         case '_id':
//             return {'_id': value}
//         case 'propertyId':
//             return {'propertyId': new Types.ObjectId(value)}
//         case 'likeId':
//             return {'likeId': new Types.ObjectId(value)}
//         default:
//             return {}
//     }
// }
// ***************************** public enpoints ***********************************************
// get a property's like count
LikeRouter.get('/api/properties/:id/likes/count', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const propertyLikeCount = yield like_1.Like.countDocuments({ propertyId: new mongoose_1.Types.ObjectId(req.params.id) });
        res.send({ ok: true, data: { count: propertyLikeCount } });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
    }
}));
// ***************************** tenant enpoints ***********************************************
// like a property
LikeRouter.post('/api/properties/:id/likes/increment', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        // check if the tenant has already liked the property
        const isLikedAlready = yield like_1.Like.findOne({
            $and: [
                { propertyId: new mongoose_1.Types.ObjectId(req.params.id) },
                { likerId: new mongoose_1.Types.ObjectId(req.user.id) }
            ]
        });
        // if already liked, then don't act any further.
        if (isLikedAlready) {
            return res.send({ ok: true, message: 'you already liked this prop' });
        }
        // else go ahead and create the like
        const newLike = new like_1.Like({
            propertyId: new mongoose_1.Types.ObjectId(req.params.id),
            likerId: new mongoose_1.Types.ObjectId(req.user.id)
        });
        // save the new like then fetch and update the related property and tenant documents
        const relatedProperty = yield property_1.Property.findById(req.params.id);
        const relatedTenant = yield user_1.User.findById(req.user.id);
        if (!relatedProperty || !relatedTenant) {
            throw error_1.NOT_FOUND;
        }
        const like = yield newLike.save();
        if (!like) {
            throw error_1.SAVE_OPERATION_FAILED;
        }
        if (!relatedProperty.likes.includes(like._id.toString())) {
            relatedProperty.likes = relatedProperty.likes.concat(like._id.toString());
            yield relatedProperty.save();
        }
        if (!relatedTenant.likes.includes(like._id.toString())) {
            relatedTenant.likes = relatedTenant.likes.concat(like._id.toString());
            yield relatedTenant.save();
        }
        res.send({ ok: true });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ ok: false, error: `Validation Error : ${error.message}` });
            return;
        }
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// ***************************** admin enpoints ***********************************************
// get a property's like count
LikeRouter.get('/api/likes/count', auth_middleware_1.isLoggedIn, auth_middleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const likeCount = yield like_1.Like.countDocuments();
        res.send({ ok: true, data: { count: likeCount } });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
    }
}));
//# sourceMappingURL=like.js.map