"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROPERTY_IS_ALREADY_FEATURED = exports.INVALID_REQUEST = exports.TAG_ALREADY_EXISTS = exports.NOT_PROPERTY_OWNER = exports.EMAIL_ALREADY_EXITS = exports.AUTH_FAILED = exports.PASSWORD_INCORRECT = exports.LOGIN_FAILED = exports.DELETE_OPERATION_FAILED = exports.USER_UPDATE_OPERATION_FAILED = exports.SAVE_OPERATION_FAILED = exports.NEW_PASSWORD_IS_INVALID = exports.OLD_PASSWORD_IS_INCORRECT = exports.NO_ADMIN = exports.NO_LANDLORD = exports.NO_TENANT = exports.NO_USER = exports.NOT_AUTHORIZED = exports.NOT_FOUND = exports.NOT_SPECIFIED = void 0;
exports.NOT_SPECIFIED = {
    name: 'NOT SPECIFIED',
    code: 1000,
    message: 'Something went wrong',
    messageFr: 'french something went wrong'
};
exports.NOT_FOUND = {
    name: 'NOT_FOUND',
    code: 401,
    message: 'Not found! The requested resource is available',
    messageFr: 'french not found'
};
exports.NOT_AUTHORIZED = {
    name: 'NOT_AUTHORIZED',
    code: 501,
    message: 'Request is not authorized!',
    messageFr: 'french request is not authorized'
};
exports.NO_USER = {
    name: 'NO_USER_FOUND',
    code: 1001,
    message: 'No user found with provided information!',
    messageFr: 'french no user found'
};
exports.NO_TENANT = {
    name: 'NO_TENANT_FOUND',
    code: 1002,
    message: 'No tenant found with provided information!',
    messageFr: 'french no tenant found'
};
exports.NO_LANDLORD = {
    name: 'NO_LANDLORD_FOUND',
    code: 1003,
    message: 'No landlord found with provided information!',
    messageFr: 'french no landlord found'
};
exports.NO_ADMIN = {
    name: 'NO_ADMIN_FOUND',
    code: 1004,
    message: 'No admin found with provided information!',
    messageFr: 'french no admin found'
};
exports.OLD_PASSWORD_IS_INCORRECT = {
    name: 'OLD_PASSWORD_IS_INCORRECT',
    code: 1005,
    message: 'Your old password is incorrect!',
    messageFr: 'french old password incorrect'
};
exports.NEW_PASSWORD_IS_INVALID = {
    name: 'NEW_PASSWORD_IS_INVALID',
    code: 1006,
    message: 'Your new password is invalid!',
    messageFr: 'french new password invalid'
};
exports.SAVE_OPERATION_FAILED = {
    name: 'SAVE_OPERATION_FAILED',
    code: 1007,
    message: 'Document failed to save, please try again.',
    messageFr: 'french document '
};
exports.USER_UPDATE_OPERATION_FAILED = {
    name: 'USER_UPDATE_OPERATION_FAILED',
    code: 1007,
    message: 'User profile update failed, please try again.',
    messageFr: 'french user profile update failed '
};
exports.DELETE_OPERATION_FAILED = {
    name: 'DELETE_OPERATION_FAILED',
    code: 1008,
    message: 'Document delete operation failed, please try again.',
    messageFr: 'french delete operatio failed'
};
exports.LOGIN_FAILED = {
    name: 'LOGIN_FAILED',
    code: 1009,
    message: 'Login request failed! Email and/or Password are/is incorrect.',
    messageFr: 'french login failed'
};
exports.PASSWORD_INCORRECT = {
    name: 'PASSWORD_INCORRECT',
    code: 1010,
    message: 'Login request failed! Password is incorrect.',
    messageFr: 'french password incorrect'
};
exports.AUTH_FAILED = {
    name: 'AUTHENTICATION FAILED',
    code: 1011,
    message: 'You must be authenticated to access this feature',
    messageFr: 'french authentication failed'
};
exports.EMAIL_ALREADY_EXITS = {
    name: 'EMAIL DUPLICATION',
    code: 1012,
    message: 'This email already exists. Please try with a different email address.',
    messageFr: 'french eamil already exists'
};
exports.NOT_PROPERTY_OWNER = {
    name: 'NOT PROPERTY OWNER',
    code: 1013,
    message: 'This property does not belong to the current landlord',
    messageFr: 'french property not belong to current owner'
};
const TAG_ALREADY_EXISTS = (code, type, refId) => {
    return {
        name: 'NOT PROPERTY TAG_ALREADY_EXISTS',
        code: 1014,
        message: `The tag code:${code} has already been added for ${type} with Id: ${refId}`,
        messageFr: 'french property not belong to current owner'
    };
};
exports.TAG_ALREADY_EXISTS = TAG_ALREADY_EXISTS;
exports.INVALID_REQUEST = {
    name: 'NOT INVALID_REQUEST',
    code: 1015,
    message: 'The request is invalid',
    messageFr: 'french request is invalid'
};
exports.PROPERTY_IS_ALREADY_FEATURED = {
    name: 'NOT PROPERTY_IS_ALREADY_FEATURED',
    code: 1016,
    message: 'This property is already featured',
    messageFr: 'french this property is already featured'
};
//# sourceMappingURL=error.js.map