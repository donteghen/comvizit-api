"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doCron = void 0;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({ legacyMode: true });
redisClient.on('error', err => console.log('Redis Client Error', err));
const CronJob = require('cron-cluster')(redisClient).CronJob;
function doCron() {
    let job = new CronJob('* * * * *', function () {
        console.log('just testing');
        return;
    });
    job.start();
}
exports.doCron = doCron;
//# sourceMappingURL=play.js.map