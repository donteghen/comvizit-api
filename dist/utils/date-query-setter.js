"use strict";
/**
 * set the date filter condition
 * @function setDateFilter
 * @param {string} startDate - The date's lower range limit
 * @param {string} endDate - The date's upper range limit
 * @return {any}
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDateFilter = void 0;
function setDateFilter(startDate, endDate) {
    let condition = {};
    if (startDate && startDate.length > 0 && !endDate) {
        condition = {
            createdAt: {
                $gt: new Date(startDate)
            }
        };
    }
    else if (!startDate && endDate && endDate.length > 0) {
        condition = {
            createdAt: {
                $lt: new Date(endDate)
            }
        };
    }
    else if (startDate && startDate.length > 0 && endDate && endDate.length > 0) {
        condition = {
            $and: [
                {
                    createdAt: {
                        $gt: new Date(startDate)
                    }
                },
                {
                    createdAt: {
                        $lt: new Date(endDate)
                    }
                }
            ]
        };
    }
    else {
        condition = {};
    }
    return condition;
}
exports.setDateFilter = setDateFilter;
//# sourceMappingURL=date-query-setter.js.map