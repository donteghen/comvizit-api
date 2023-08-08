import { logger } from '../logs/logger';
import { Review } from '../models/review';
import { RentalHistory } from '../models/rental-history';
import { constants } from '../constants';
import { User } from '../models/user';

// mailer
import { mailer } from '../helper/mailer';
import { notifyTenantToReviewProperty } from '../utils/mailer-templates';

export default async function propertyReviewReminder () {
    console.log(new Date(Date.now()),'*** Property Review Reminder Cron Job Starting ***');
    try {
        const twoDaysAgo : number = Date.now() - (48 * 60 * 60 * 1000);
        // all terminated rental history records within the past 2 days
        const rentalHistoryRecords = await RentalHistory.find({
            $and: [
                {
                    status: constants.RENTAL_HISTORY_STATUS_OPTIONS.TERMINATED
                },
                {
                    endDate: {
                        $gt : twoDaysAgo
                    }
                }
            ]
        });
        if (rentalHistoryRecords.length > 0) {
            // console.log('here are list of tenant who have to review property: ', rentalHistoryRecords.map(x => x.unique_id))
            for(let record of rentalHistoryRecords) {
                // check if the associated tenant already left a review for the associated landlord
                const tenantReveiw = await Review.findOne({
                    type: constants.REVIEW_TYPES.PROPERTY,
                    authorType: constants.REVIEW_AUTHOR_TYPE.TENANT,
                    author: record.tenantId,
                    refId: record.propertyId?.toString()
                });
                if (!tenantReveiw) {
                    // get tenant and landlord info for email
                    const tenant = await User.findById(tenantReveiw.author?.toString(), {fullname:1, email:1});
                    const landlord = await User.findById(record.landlordId.toString(), {fullname:1});
                    // send reminder email to tenant
                    const _link = `${process.env.CLIENT_URL}/profile`;
                    const {_subject, _heading, _detail, _linkText} = notifyTenantToReviewProperty(tenant.fullname, landlord.fullname);
                    const success = await mailer(tenant.email, _subject, _heading, _detail, _link, _linkText )  ;
                }
            }
        }
        return;
    } catch (error) {
        console.log(`[${new Date()}] : PropertyReviewReminder failed due to: `, error);
        logger.error(`propertyReviewReminder falied due to ${error?.message??'Unknown reasosn'}`);
        return;
    }
}