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
exports.updatePropertyFeaturingCron = void 0;
const redis_1 = require("redis");
const featured_properties_1 = require("../models/featured-properties");
const redisClient = (0, redis_1.createClient)({ legacyMode: true });
const CronJob = require('cron-cluster')(redisClient).CronJob;
function updatePropertyFeaturingCron() {
    const job = new CronJob('0 6 * * *', function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('working on cron*************************************');
                const featuredProperties = yield featured_properties_1.FeaturedProperties.find({ status: 'Active' });
                if (featuredProperties.length > 0) {
                    for (const featProp of featuredProperties) {
                        console.log(featProp);
                        if ((Date.now() - featProp.startedAt) > featProp.duration) {
                            console.log('condidate');
                            featProp.status = 'InActive';
                            yield featProp.save();
                        }
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    });
    job.start();
}
exports.updatePropertyFeaturingCron = updatePropertyFeaturingCron;
const main = () => {
    updatePropertyFeaturingCron();
};
exports.default = main;
//# sourceMappingURL=cron.js.map