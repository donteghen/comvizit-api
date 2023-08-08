import { logger } from '../logs/logger';
import { RentIntention } from '../models/rent-intention';
import { constants } from '../constants';
import { Property } from '../models/property';


export default async function resetBookedProperties () {
    console.log(new Date(Date.now()),'*** Reset Booked Properties Cron Job Starting ***');
    try {
        const fiveDaysAgo : number = Date.now() - (120 * 60 * 60 * 1000);
        // get all initiated rent intentiosn
        const initiatedRentIntentions = await RentIntention.find({
            $and: [
                {status: constants.RENT_INTENTION_STATUS_OPTIONS.INITIATED},
                {
                    initiatedAt : {
                        $lt: fiveDaysAgo
                    }
                }
            ]
        });
        if (initiatedRentIntentions.length > 0) {
            // console.log('here are list of initiated bookings to be reset: ', initiatedRentIntentions.map(x => x.unique_id))
            // reset the status to the associated property to available
            for(let initiatedIntention of initiatedRentIntentions) {
                // cancel the booking
                initiatedIntention.status = constants.RENT_INTENTION_STATUS_OPTIONS.CANCELED;
                await initiatedIntention.save();
                // reset the property's availability to available
                const associatedProperty = await Property.findById(initiatedIntention.propertyId.toString());
                if (associatedProperty?.availability !== constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE){
                    associatedProperty.availability = constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE;
                    await associatedProperty.save()
                }

            }
        }

        return;
    } catch (error) {
        console.log(`[${new Date()}] : ResetBookedProperties failed due to: `, error);
        logger.error(`ResetBookedProperties falied due to ${error?.message??'Unknown reasosn'}`)
        return;
    }
}