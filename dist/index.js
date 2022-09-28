"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// local module imports
const dbconfig_1 = require("./config/dbconfig");
// global settings
dotenv_1.default.config();
(0, dbconfig_1.connectDb)().then(() => console.log('db connected'))
    .catch(err => console.log(err));
const PORT = process.env.PORT;
const server_1 = require("./server");
// start server
server_1.app.listen(PORT, () => {
    console.log(`Server is listining at: http://loccalhost:${PORT}`);
});
//# sourceMappingURL=index.js.map