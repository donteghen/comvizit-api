"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
const mongoose_1 = require("mongoose");
const dbConnector = () => {
    (0, mongoose_1.connect)(process.env.MONGO_STRING).then(() => console.log('db connected')).catch(err => console.log(err));
};
function connectDb() {
    dbConnector();
}
exports.connectDb = connectDb;
//# sourceMappingURL=dbconfig.js.map