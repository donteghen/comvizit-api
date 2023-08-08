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
const logger_1 = require("../logs/logger");
const rent_intention_1 = require("../models/rent-intention");
const constants_1 = require("../constants");
const property_1 = require("../models/property");
function resetBookedProperties() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(new Date(Date.now()), '*** Reset Booked Properties Cron Job Starting ***');
        try {
            const fiveDaysAgo = Date.now() - (120 * 60 * 60 * 1000);
            // get all initiated rent intentiosn
            const initiatedRentIntentions = yield rent_intention_1.RentIntention.find({
                $and: [
                    { status: constants_1.constants.RENT_INTENTION_STATUS_OPTIONS.INITIATED },
                    {
                        initiatedAt: {
                            $lt: fiveDaysAgo
                        }
                    }
                ]
            });
            if (initiatedRentIntentions.length > 0) {
                // console.log('here are list of initiated bookings to be reset: ', initiatedRentIntentions.map(x => x.unique_id))
                // reset the status to the associated property to available
                for (let initiatedIntention of initiatedRentIntentions) {
                    // cancel the booking
                    initiatedIntention.status = constants_1.constants.RENT_INTENTION_STATUS_OPTIONS.CANCELED;
                    yield initiatedIntention.save();
                    // reset the property's availability to available
                    const associatedProperty = yield property_1.Property.findById(initiatedIntention.propertyId.toString());
                    if ((associatedProperty === null || associatedProperty === void 0 ? void 0 : associatedProperty.availability) !== constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE) {
                        associatedProperty.availability = constants_1.constants.PROPERTY_AVAILABILITY_STATUS_OPTIONS.AVAILABLE;
                        yield associatedProperty.save();
                    }
                }
            }
            return;
        }
        catch (error) {
            console.log(`[${new Date()}] : ResetBookedProperties failed due to: `, error);
            logger_1.logger.error(`ResetBookedProperties falied due to ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown reasosn'}`);
            return;
        }
    });
}
exports.default = resetBookedProperties;
//# sourceMappingURL=reset-booked-properties.js.map