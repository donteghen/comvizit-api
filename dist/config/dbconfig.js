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
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDb = exports.clearDb = exports.connectDb = void 0;
const mongoose_1 = require("mongoose");
const connectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connect)(process.env.MONGO_STRING);
});
exports.connectDb = connectDb;
function clearDb() {
    return __awaiter(this, void 0, void 0, function* () {
        const collections = yield mongoose_1.connection.db.collections();
        for (const currCollection of collections) {
            currCollection.deleteMany({});
        }
    });
}
exports.clearDb = clearDb;
function closeDb() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mongoose_1.connection) {
            return;
        }
        yield mongoose_1.connection.close();
    });
}
exports.closeDb = closeDb;
//# sourceMappingURL=dbconfig.js.map