"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const logconfig_1 = __importDefault(require("./logconfig"));
const logger = {
    error: (mess) => {
        logconfig_1.default.error(mess);
    },
    warn: (mess) => {
        logconfig_1.default.warn(mess);
    },
    info: (mess) => {
        logconfig_1.default.info(mess);
    },
    http: (mess) => {
        logconfig_1.default.http(mess);
    },
    verbose: (mess) => {
        logconfig_1.default.verbose(mess);
    },
    debug: (mess) => {
        logconfig_1.default.debug(mess);
    },
    silly: (mess) => {
        logconfig_1.default.silly(mess);
    }
};
exports.logger = logger;
//# sourceMappingURL=logger.js.map