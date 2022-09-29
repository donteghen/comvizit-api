"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function adminAuth(req, res, next) {
    const { ADMIN_AUTH_NAME, ADMIN_AUTH_PASSWORD, ADMIN_AUTH_SECRET } = process.env;
    if (req.headers.authname !== ADMIN_AUTH_NAME || req.headers.authpassword !== ADMIN_AUTH_PASSWORD || req.headers.authsecret !== ADMIN_AUTH_SECRET) {
        throw new Error('Authentication Needed!');
    }
    next();
}
exports.default = adminAuth;
//# sourceMappingURL=middleware.js.map