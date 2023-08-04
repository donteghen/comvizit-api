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
const featured_properties_1 = require("../models/featured-properties");
const logger_1 = require("../logs/logger");
function updatePropertyFeaturing() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(new Date(Date.now()), '*** Featured Property Update Cron Job Starting ***');
            const featuredProperties = yield featured_properties_1.FeaturedProperties.find({ status: 'Active' });
            if (featuredProperties.length > 0) {
                for (const featProp of featuredProperties) {
                    if ((Date.now() - featProp.startedAt) > featProp.duration) {
                        featProp.status = 'Inactive';
                        yield featProp.save();
                    }
                }
            }
            return;
        }
        catch (error) {
            console.log(`[${new Date()}] : UpdatePropertyFeaturingCron failed due to: `, error);
            logger_1.logger.error(`UpdatePropertyFeaturingCron falied due to ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown reasosn'}`);
            return;
        }
    });
}
exports.default = updatePropertyFeaturing;
//# sourceMappingURL=update-property-featuring.js.map