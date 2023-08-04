/** TODO research on how to add a handler to redis client */
import {createClient} from 'redis';
const redisClient = createClient({legacyMode: true });
// redisClient.connect().catch(console.error);
const CronJob = require('cron-cluster')(redisClient).CronJob;


// import cron functions
import updatePropertyFeaturing from '../rental-activities/update-property-featuring';
import propertyReviewReminder from '../rental-activities/property-review-reminder';
import landlordReviewReminder from '../rental-activities/landlord-review-reminder';
import resetBookedProperties from '../rental-activities/reset-booked-properties';


function updatePropertyFeaturingCron () {
    const job = new CronJob('0 6 * * *', updatePropertyFeaturing)
    job.start();
}

function propertyReviewReminderCron () {
    const job = new CronJob('0 8 * * MON', propertyReviewReminder);
    job.start();
}

function landlordReviewReminderCron () {
    const job = new CronJob('0 8 * * MON', landlordReviewReminder);
    job.start();
}

function resetBookedPropertiesCron () {
    const job = new CronJob('0 18 * * *', resetBookedProperties);
    job.start();
}




function cronScheduler () {
    console.log('...Registering cron schedulers...');
    updatePropertyFeaturingCron();
    propertyReviewReminderCron();
    landlordReviewReminderCron();
    resetBookedPropertiesCron();
}


export default cronScheduler