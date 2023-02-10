
import {createClient} from 'redis'
import { Property } from '../models/property';
import { FeaturedProperties } from '../models/featured-properties'
const redisClient = createClient({legacyMode: true })
redisClient.connect().catch(console.error);
const CronJob = require('cron-cluster')(redisClient).CronJob


export function updatePropertyFeaturingCron () {
    const job = new CronJob('0 6 * * *', async function () {
        try {
            console.log(new Date(Date.now()),'*** Featured Property Update Cron Job Starting ***')
            const featuredProperties = await FeaturedProperties.find({status: 'Active'})

            if (featuredProperties.length > 0) {
                for(const featProp of featuredProperties) {
                    if ((Date.now() - featProp.startedAt) > featProp.duration) {
                        featProp.status = 'Inactive'
                        await featProp.save()
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
    })
    job.start()
  }


  const cronScheduler = () => {
    updatePropertyFeaturingCron()
  }


export default cronScheduler