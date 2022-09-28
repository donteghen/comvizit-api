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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// global settings
dotenv_1.default.config();
// connectDb()
const PORT = process.env.PORT;
// declare and initail parameters
const app = (0, express_1.default)();
exports.app = app;
// middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//  Routes
app.get('/api/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send({ foo: 'bar' });
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}));
// start server
app.listen(PORT, () => {
    console.log(`Server is listining at: http://loccalhost:${PORT}`);
});
//# sourceMappingURL=index.js.map