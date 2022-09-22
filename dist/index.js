"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// local module imports
const dbconfig_1 = require("./config/dbconfig");
// global settings
dotenv_1.default.config();
(0, dbconfig_1.connectDb)();
const PORT = process.env.PORT;
// declare and initail parameters
const app = (0, express_1.default)();
// middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//  Routes
// start server
app.listen(PORT, () => {
    console.log(`Server is listining at: http://loccalhost:${PORT}`);
});
//# sourceMappingURL=index.js.map