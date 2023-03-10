"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const logger_1 = require("../logs/logger");
const multerUpload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({}),
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/i)) {
            logger_1.logger.error(`Someone tried uploading a file of type : ${file.mimetype}`);
            return cb(new Error('file must be png, jpg or jpeg'));
        }
        cb(undefined, true);
    }
});
exports.default = multerUpload;
//# sourceMappingURL=multerUpload.js.map