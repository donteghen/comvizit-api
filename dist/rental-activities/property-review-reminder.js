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
const review_1 = require("../models/review");
const rental_history_1 = require("../models/rental-history");
const declared_1 = require("../constants/declared");
const user_1 = require("../models/user");
// mailer
const mailer_1 = require("../helper/mailer");
const mailer_templates_1 = require("../utils/mailer-templates");
function propertyReviewReminder() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(new Date(Date.now()), '*** Property Review Reminder Cron Job Starting ***');
        try {
            const twoDaysAgo = Date.now() - (48 * 60 * 60 * 1000);
            // all terminated rental history records within the past 2 days
            const rentalHistoryRecords = yield rental_history_1.RentalHistory.find({
                $and: [
                    {
                        status: declared_1.constants.RENTAL_HISTORY_STATUS_OPTIONS.TERMINATED
                    },
                    {
                        endDate: {
                            $gt: twoDaysAgo
                        }
                    }
                ]
            });
            if (rentalHistoryRecords.length > 0) {
                // console.log('here are list of tenant who have to review property: ', rentalHistoryRecords.map(x => x.unique_id))
                for (let record of rentalHistoryRecords) {
                    // check if the associated tenant already left a review for the associated landlord
                    const tenantReveiw = yield review_1.Review.findOne({
                        type: declared_1.constants.REVIEW_TYPES.PROPERTY,
                        authorType: declared_1.constants.REVIEW_AUTHOR_TYPE.TENANT,
                        author: record.tenantId,
                        refId: (_a = record.propertyId) === null || _a === void 0 ? void 0 : _a.toString()
                    });
                    if (!tenantReveiw) {
                        // get tenant and landlord info for email
                        const tenant = yield user_1.User.findById((_b = tenantReveiw.author) === null || _b === void 0 ? void 0 : _b.toString(), { fullname: 1, email: 1 });
                        const landlord = yield user_1.User.findById(record.landlordId.toString(), { fullname: 1 });
                        // send reminder email to tenant
                        const _link = `${process.env.CLIENT_URL}/profile`;
                        const { _subject, _heading, _detail, _linkText } = (0, mailer_templates_1.notifyTenantToReviewProperty)(tenant.fullname, landlord.fullname);
                        const success = yield (0, mailer_1.mailer)(tenant.email, _subject, _heading, _detail, _link, _linkText);
                    }
                }
            }
            return;
        }
        catch (error) {
            console.log(`[${new Date()}] : PropertyReviewReminder failed due to: `, error);
            logger_1.logger.error(`propertyReviewReminder falied due to ${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : 'Unknown reasosn'}`);
            return;
        }
    });
}
exports.default = propertyReviewReminder;
//# sourceMappingURL=property-review-reminder.js.map