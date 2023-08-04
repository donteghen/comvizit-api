
import { FeaturedProperties } from '../models/featured-properties'
import { logger } from '../logs/logger';

export default async function updatePropertyFeaturing () {
    try {
        console.log(new Date(Date.now()),'*** Featured Property Update Cron Job Starting ***');
        const featuredProperties = await FeaturedProperties.find({status: 'Active'});

        if (featuredProperties.length > 0) {
            for(const featProp of featuredProperties) {
                if ((Date.now() - featProp.startedAt) > featProp.duration) {
                    featProp.status = 'Inactive';
                    await featProp.save();
                }
            }
        }
        return;
    } catch (error) {
        console.log(`[${new Date()}] : UpdatePropertyFeaturingCron failed due to: `, error);
        logger.error(`UpdatePropertyFeaturingCron falied due to ${error?.message??'Unknown reasosn'}`)
        return;
    }
}