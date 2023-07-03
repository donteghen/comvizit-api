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
const logger_1 = require("../logs/logger");
const prodEnv = process.env.NODE_ENV === 'production';
const connectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    mongoose_1.connection.on('error', (error) => {
        var _a, _b;
        if (prodEnv) {
            console.log(`A db error occured : ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "Unknown"}`);
        }
        else {
            logger_1.logger.error(`A db error occured : ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : "Unknown"}`);
        }
    });
    mongoose_1.connection.once('open', function () {
        if (prodEnv) {
            logger_1.logger.info("MONGODB Intializing autoincrement plugin");
        }
        else {
            console.log("MONGODB Intializing autoincrement plugin");
        }
    });
    mongoose_1.connection.on('reconnected', () => {
        if (prodEnv) {
            logger_1.logger.info('MONGODB Connection Reestablished');
        }
        else {
            console.log('MONGODB Connection Reestablished');
        }
    });
    mongoose_1.connection.on('disconnected', () => {
        if (prodEnv) {
            logger_1.logger.info('MONGODB Connection Disconnected');
        }
        else {
            console.log('MONGODB Connection Disconnected');
        }
    });
    mongoose_1.connection.on('close', () => {
        if (prodEnv) {
            logger_1.logger.info('MONGODB Connection Closed');
        }
        else {
            console.log('MONGODB Connection Closed');
        }
    });
    mongoose_1.connection.on('error', (error) => {
        if (prodEnv) {
            logger_1.logger.info(`MONGODB ERROR: ${error}`);
        }
        else {
            console.log('MONGODB ERROR:', error);
        }
        console.error('MONGODB ERROR:', error);
    });
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