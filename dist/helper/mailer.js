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
exports.mailer = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const mailer_html_1 = require("../utils/mailer-html");
const mailer = (toEmail, subject, heading, detail, link, linkText) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let mailresponse: MailResponse
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: `${toEmail}`,
            from: `${process.env.SENDGRID_VERIFIED_SENDER}`,
            subject: `${subject}`,
            text: `${heading}/n/n ${detail}`,
            html: (0, mailer_html_1.mailerHtml)(heading, detail, link, linkText),
        };
        yield mail_1.default.send(msg);
        return {
            ok: true,
            error: '',
            message: 'Successfuly send!'
        };
    }
    catch (error) {
        return {
            ok: false,
            error: error.response.body,
            message: ''
        };
    }
});
exports.mailer = mailer;
//# sourceMappingURL=mailer.js.map