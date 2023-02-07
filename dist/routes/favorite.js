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
exports.FavoriteRouter = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const user_1 = require("../models/user");
const error_1 = require("../constants/error");
const auth_middleware_1 = require("../middleware/auth-middleware");
const favorite_1 = require("../models/favorite");
const FavoriteRouter = express_1.default.Router();
exports.FavoriteRouter = FavoriteRouter;
// ***************************** tenant enpoints ***********************************************
// get a tenant's favorite property list
FavoriteRouter.get('/api/fav-property-list', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let favProperties = [];
        const favIdList = req.user.favorites;
        if (favIdList && favIdList.length > 0) {
            favProperties = yield favorite_1.Favorite.aggregate([
                {
                    $match: {
                        _id: { $in: favIdList.map(id => new mongoose_1.Types.ObjectId(id)) }
                    }
                },
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
                        path: '$property'
                    }
                }
            ]);
        }
        res.send({ ok: true, data: favProperties });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_a = error.code) !== null && _a !== void 0 ? _a : 1000 });
    }
}));
// Add a property to tenant's favorite property list
FavoriteRouter.patch('/api/fav-property-list/add-favorite', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const propertyId = req.body.id;
        if (!propertyId) {
            throw error_1.NOT_FOUND;
        }
        const user = yield user_1.User.findById(req.user.id);
        const favAlreadyExit = yield favorite_1.Favorite.findOne({
            $and: [
                { propertyId: new mongoose_1.Types.ObjectId(propertyId) },
                { userId: user._id }
            ]
        });
        // check if fav is already added
        if (favAlreadyExit) {
            return res.send({ ok: true, message: 'Property already added to favorite list' });
        }
        // if not added yet, create a new fav document
        const newFav = new favorite_1.Favorite({
            propertyId: new mongoose_1.Types.ObjectId(propertyId),
            userId: user._id
        });
        const fav = yield newFav.save();
        // update user document favorite property
        let userFavList = user.favorites;
        if (!userFavList.includes(fav._id.toString())) {
            userFavList = userFavList.concat(fav._id.toString());
            user.favorites = userFavList;
            yield user.save();
        }
        res.send({ ok: true });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_b = error.code) !== null && _b !== void 0 ? _b : 1000 });
    }
}));
// Remove a property from tenant's favorite property list
FavoriteRouter.patch('/api/fav-property-list/remove-favorite', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const favId = req.body.id;
        if (!favId) {
            throw error_1.NOT_FOUND;
        }
        const fav = yield favorite_1.Favorite.findById(favId);
        if (!fav) {
            throw error_1.NOT_FOUND;
        }
        // delete the fav
        yield favorite_1.Favorite.findByIdAndRemove(fav._id);
        // remove fav from tenant's fav list
        let userFavList = req.user.favorites;
        const user = yield user_1.User.findById(req.user.id);
        if ((userFavList === null || userFavList === void 0 ? void 0 : userFavList.length) > 0) {
            userFavList = userFavList.filter(id => id !== fav._id.toString());
        }
        user.favorites = userFavList;
        const updatedUser = yield user.save();
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_c = error.code) !== null && _c !== void 0 ? _c : 1000 });
    }
}));
// Clear tenant's favorite property list
FavoriteRouter.patch('/api/fav-property-list/clear-favorite-list', auth_middleware_1.isLoggedIn, auth_middleware_1.isTenant, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        // delete all current tenant's favorite property list
        yield favorite_1.Favorite.deleteMany({
            userId: new mongoose_1.Types.ObjectId(req.user.id)
        });
        // clear tenant's fav list
        const user = yield user_1.User.findById(req.user.id);
        user.favorites = [];
        const updatedUser = yield user.save();
        res.send({ ok: true, data: updatedUser });
    }
    catch (error) {
        res.status(400).send({ ok: false, error: error.message, code: (_d = error.code) !== null && _d !== void 0 ? _d : 1000 });
    }
}));
//# sourceMappingURL=favorite.js.map