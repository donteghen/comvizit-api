"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** TODO research on how to add a handler to redis client */
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({ legacyMode: true });
// redisClient.connect().catch(console.error);
const CronJob = require('cron-cluster')(redisClient).CronJob;
// import cron functions
const update_property_featuring_1 = __importDefault(require("../rental-activities/update-property-featuring"));
const property_review_reminder_1 = __importDefault(require("../rental-activities/property-review-reminder"));
const landlord_review_reminder_1 = __importDefault(require("../rental-activities/landlord-review-reminder"));
const reset_booked_properties_1 = __importDefault(require("../rental-activities/reset-booked-properties"));
function updatePropertyFeaturingCron() {
    const job = new CronJob('0 6 * * *', update_property_featuring_1.default);
    job.start();
}
function propertyReviewReminderCron() {
    const job = new CronJob('0 8 * * MON', property_review_reminder_1.default);
    job.start();
}
function landlordReviewReminderCron() {
    const job = new CronJob('0 8 * * MON', landlord_review_reminder_1.default);
    job.start();
}
function resetBookedPropertiesCron() {
    const job = new CronJob('0 18 * * *', reset_booked_properties_1.default);
    job.start();
}
function cronScheduler() {
    console.log('...Registering cron schedulers...');
    updatePropertyFeaturingCron();
    propertyReviewReminderCron();
    landlordReviewReminderCron();
    resetBookedPropertiesCron();
}
exports.default = cronScheduler;
//# sourceMappingURL=cron.js.map