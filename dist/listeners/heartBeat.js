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
exports.onHeartBeat = void 0;
const mongoose_1 = require("mongoose");
const user_1 = require("../models/user");
const logger_1 = require("../logs/logger");
function onHeartBeat(data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Updating the online status for user with Id', data.senderId);
        // update the socket user's online status
        try {
            const user = yield user_1.User.findOne({ _id: new mongoose_1.Types.ObjectId(data.senderId) });
            if (!user.isOnline) {
                const now = Date.now();
                user.isOnline = true,
                    user.lastOnlineDate = new Date(now),
                    user.updated = now;
            }
            yield user.save();
        }
        catch (error) {
            logger_1.logger.error(`User update failed on heartbeat event due to : ${error !== null && error !== void 0 ? error : "Unrecognized reasons"}`);
            return;
        }
    });
}
exports.onHeartBeat = onHeartBeat;
//# sourceMappingURL=heartBeat.js.map