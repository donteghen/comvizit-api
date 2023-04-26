"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAT_MESSAGE_PARAM_INVALID = exports.CHAT_PARAM_INVALID = exports.FEATURING_EXPIRED = exports.RENTALHISTORY_CURRENTLY_ONGOING = exports.RENTINTENTION_ALREADY_EXISTS = exports.ADDED_ALREADY_TO_FAV_LIST = exports.REVIEW_ALREADY_EXIST = exports.ACCOUNST_IS_ALREADY_VERIFIED = exports.RESET_TOKEN_DEACTIVED = exports.INVALID_RESET_TOKEN = exports.PROPERTY_UNAVAILABLE_FOR_FEATURING = exports.INVALID_PROPERTY_ID_FOR_FEATURING = exports.PROPERTY_IS_ALREADY_FEATURED = exports.INVALID_REQUEST = exports.TAG_ALREADY_EXISTS = exports.NOT_PROPERTY_OWNER = exports.EMAIL_ALREADY_EXITS = exports.AUTH_FAILED = exports.PASSWORD_INCORRECT = exports.LOGIN_FAILED = exports.DELETE_OPERATION_FAILED = exports.USER_UPDATE_OPERATION_FAILED = exports.SAVE_OPERATION_FAILED = exports.NEW_PASSWORD_IS_INVALID = exports.OLD_PASSWORD_IS_INCORRECT = exports.NO_ADMIN = exports.NO_LANDLORD = exports.NO_TENANT = exports.NO_USER = exports.NOT_AUTHORIZED = exports.NOT_FOUND = exports.NOT_SPECIFIED = void 0;
exports.NOT_SPECIFIED = {
    name: 'NOT SPECIFIED',
    code: 1000,
    message: 'Something went wrong',
    messageFr: 'french something went wrong'
};
exports.NOT_FOUND = {
    name: 'NOT_FOUND',
    code: 404,
    message: 'Not found! The requested resource is not available',
    messageFr: 'french not found'
};
exports.NOT_AUTHORIZED = {
    name: 'NOT_AUTHORIZED',
    code: 401,
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
    name: 'NOT_PROPERTY OWNER',
    code: 1013,
    message: 'This property does not belong to the current landlord',
    messageFr: 'french property not belong to current owner'
};
const TAG_ALREADY_EXISTS = (code, type, refId) => {
    return {
        name: 'TAG_ALREADY_EXISTS',
        code: 1014,
        message: `The tag code:${code} has already been added for ${type} with Id: ${refId}`,
        messageFr: 'french property not belong to current owner'
    };
};
exports.TAG_ALREADY_EXISTS = TAG_ALREADY_EXISTS;
exports.INVALID_REQUEST = {
    name: 'INVALID_REQUEST',
    code: 1015,
    message: 'The request is invalid',
    messageFr: 'french request is invalid'
};
exports.PROPERTY_IS_ALREADY_FEATURED = {
    name: 'PROPERTY_IS_ALREADY_FEATURED',
    code: 1016,
    message: 'This property is already featured',
    messageFr: 'french this property is already featured'
};
exports.INVALID_PROPERTY_ID_FOR_FEATURING = {
    name: 'INVALID_PROPERTY_ID_FOR_FEATURING',
    code: 1017,
    message: 'The provided property id doesn\'t match any existing Property.',
    messageFr: 'french The provided property id doesn\'t match any existing Property'
};
exports.PROPERTY_UNAVAILABLE_FOR_FEATURING = {
    name: 'PROPERTY_UNAVAILABLE_FOR_FEATURING',
    code: 1017,
    message: 'The provided property isn\'t available for featuring.',
    messageFr: 'french The provided property isn\'t available for featuring.'
};
exports.INVALID_RESET_TOKEN = {
    name: 'INVALID_RESET_TOKEN',
    code: 1018,
    message: 'The reset token provided is invalid',
    messageFr: 'french The reset token provided is invalid'
};
exports.RESET_TOKEN_DEACTIVED = {
    name: 'RESET_TOKEN_DEACTIVED',
    code: 1019,
    message: 'The reset token provided is no longer active',
    messageFr: 'french The reset token provided is no longer active'
};
exports.ACCOUNST_IS_ALREADY_VERIFIED = {
    name: 'ACCOUNST_IS_ALREADY_VERIFIED',
    code: 1020,
    message: 'Your account has already been verified',
    messageFr: 'french Your account has already been verified'
};
exports.REVIEW_ALREADY_EXIST = {
    name: 'REVIEW_ALREADY_EXIST',
    code: 1021,
    message: 'You can only review once',
    messageFr: 'french You can only review once'
};
exports.ADDED_ALREADY_TO_FAV_LIST = {
    name: 'ADDED_ALREADY_TO_FAV_LIST',
    code: 1022,
    message: 'This property ahs alredy been added to your favorite list',
    messageFr: 'French this property ahs alredy been added to your favorite list'
};
exports.RENTINTENTION_ALREADY_EXISTS = {
    name: 'RENTINTENTION_ALREADY_EXISTS',
    code: 1023,
    message: 'You already initiated a rent-intension for this property',
    messageFr: 'French You already initiated a rent-intension for this property'
};
exports.RENTALHISTORY_CURRENTLY_ONGOING = {
    name: 'RENTALHISTORY_CURRENTLY_ONGOING',
    code: 1023,
    message: 'There is an ongoing rental history with the provided parameters',
    messageFr: 'French There is an ongoing rental history with the provided parameters'
};
exports.FEATURING_EXPIRED = {
    name: 'FEATURING_EXPIRED',
    code: 1024,
    message: 'This feature is expired, please start a new one',
    messageFr: 'French This feature is expired, please start a new one'
};
exports.CHAT_PARAM_INVALID = {
    name: 'CHAT_PARAM_INVALID',
    code: 1025,
    message: 'Either the senderId is missing(or invalid) or receiverId is missing(or invalid)',
    messageFr: 'French Either the senderId is missing(or invalid) or receiverId is missing(or invalid)'
};
exports.CHAT_MESSAGE_PARAM_INVALID = {
    name: 'CHAT_MESSAGE_PARAM_INVALID',
    code: 1025,
    message: 'Missing or invalid params were provided for chatId, senderId or content',
    messageFr: 'French issing or invalid params were provided for chatId, senderId or content'
};
//# sourceMappingURL=error.js.map