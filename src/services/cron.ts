
import {createClient} from 'redis'
import { FeaturedProperties } from '../models/featured-properties'
const redisClient = createClient({legacyMode: true })
const CronJob = require('cron-cluster')(redisClient).CronJob


export function updatePropertyFeaturingCron () {
    const job = new CronJob('0 6 * * *', async function () {
        try {
            console.log('working on cron*************************************')
            const featuredProperties = await FeaturedProperties.find({status: 'Active'})

            if (featuredProperties.length > 0) {
                for(const featProp of featuredProperties) {
                    console.log(featProp)
                    if ((Date.now() - featProp.startedAt) > featProp.duration) {
                        console.log('condidate')
                        featProp.status = 'InActive'
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

  const main = () => {
    updatePropertyFeaturingCron()
  }

export default main