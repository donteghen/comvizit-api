import {ErrorResponse} from '../models/interfaces'

export const NOT_SPECIFIED: ErrorResponse = {
    name: 'NOT SPECIFIED',
    code: 1000,
    message: 'Something went wrong',
    messageFr: 'french something went wrong'
}


export const NOT_FOUND: ErrorResponse = {
    name:'NOT_FOUND',
    code: 401,
    message: 'Not found! The requested resource is available',
    messageFr: 'french not found'
}

export const NOT_AUTHORIZED: ErrorResponse = {
    name:'NOT_AUTHORIZED',
    code: 501,
    message: 'Request is not authorized!',
    messageFr: 'french request is not authorized'
}

export const NO_USER: ErrorResponse = {
    name: 'NO_USER_FOUND',
    code: 1001,
    message: 'No user found with provided information!',
    messageFr: 'french no user found'
}

export const NO_TENANT: ErrorResponse = {
    name: 'NO_TENANT_FOUND',
    code: 1002,
    message: 'No tenant found with provided information!',
    messageFr: 'french no tenant found'
}

export const NO_LANDLORD: ErrorResponse = {
    name: 'NO_LANDLORD_FOUND',
    code: 1003,
    message: 'No landlord found with provided information!',
    messageFr: 'french no landlord found'
}

export const NO_ADMIN: ErrorResponse = {
    name: 'NO_ADMIN_FOUND',
    code: 1004,
    message: 'No admin found with provided information!',
    messageFr: 'french no admin found'
}

export const OLD_PASSWORD_IS_INCORRECT: ErrorResponse = {
    name: 'OLD_PASSWORD_IS_INCORRECT',
    code: 1005,
    message: 'Your old password is incorrect!',
    messageFr:'french old password incorrect'
}

export const NEW_PASSWORD_IS_INVALID: ErrorResponse = {
    name: 'NEW_PASSWORD_IS_INVALID',
    code: 1006,
    message: 'Your new password is invalid!',
    messageFr:'french new password invalid'
}


export const SAVE_OPERATION_FAILED: ErrorResponse = {
    name: 'SAVE_OPERATION_FAILED',
    code: 1007,
    message:'Document failed to save, please try again.',
    messageFr: 'french document '
}

export const USER_UPDATE_OPERATION_FAILED: ErrorResponse = {
    name: 'USER_UPDATE_OPERATION_FAILED',
    code: 1007,
    message:'User profile update failed, please try again.',
    messageFr: 'french user profile update failed '
}

export const DELETE_OPERATION_FAILED: ErrorResponse = {
    name: 'DELETE_OPERATION_FAILED',
    code: 1008,
    message:'Document delete operation failed, please try again.',
    messageFr: 'french delete operatio failed'
}



export const LOGIN_FAILED: ErrorResponse = {
    name: 'LOGIN_FAILED',
    code: 1009,
    message: 'Login request failed! Email and/or Password are/is incorrect.',
    messageFr: 'french login failed'
}

export const PASSWORD_INCORRECT: ErrorResponse = {
    name: 'PASSWORD_INCORRECT',
    code: 1010,
    message:'Login request failed! Password is incorrect.',
    messageFr: 'french password incorrect'
}


export const AUTH_FAILED: ErrorResponse = {
    name: 'AUTHENTICATION FAILED',
    code: 1011,
    message: 'You must be authenticated to access this feature',
    messageFr: 'french authentication failed'
}

export const EMAIL_ALREADY_EXITS: ErrorResponse = {
    name: 'EMAIL DUPLICATION',
    code: 1012,
    message: 'This email already exists. Please try with a different email address.',
    messageFr: 'french eamil already exists'
}

export const NOT_PROPERTY_OWNER: ErrorResponse = {
    name: 'NOT PROPERTY OWNER',
    code: 1013,
    message: 'This property does not belong to the current landlord',
    messageFr: 'french property not belong to current owner'
}

export const TAG_ALREADY_EXISTS = (code: string, type: string, refId: string) : ErrorResponse => {
    return {
        name: 'NOT PROPERTY TAG_ALREADY_EXISTS',
        code: 1014,
        message: `The tag code:${code} has already been added for ${type} with Id: ${refId}`,
        messageFr: 'french property not belong to current owner'
    }
}

export const INVALID_REQUEST: ErrorResponse = {
    name: 'NOT INVALID_REQUEST',
    code: 1015,
    message: 'The request is invalid',
    messageFr: 'french request is invalid'
}

export const PROPERTY_IS_ALREADY_FEATURED: ErrorResponse = {
    name: 'NOT PROPERTY_IS_ALREADY_FEATURED',
    code: 1016,
    message: 'This property is already featured',
    messageFr: 'french this property is already featured'
}

export const INVALID_PROPERTY_ID_FOR_FEATURING: ErrorResponse = {
    name: 'NOT INVALID_PROPERTY_ID_FOR_FEATURING',
    code: 1017,
    message: 'The provided property id doesn\'t match any existing Property.',
    messageFr: 'french The provided property id doesn\'t match any existing Property'
}

export const PROPERTY_UNAVAILABLE_FOR_FEATURING: ErrorResponse = {
    name: 'NOT PROPERTY_UNAVAILABLE_FOR_FEATURING',
    code: 1017,
    message: 'The provided property isn\'t available for featuring.',
    messageFr: 'french The provided property isn\'t available for featuring.'
}

export const INVALID_RESET_TOKEN: ErrorResponse = {
    name: 'NOT INVALID_RESET_TOKEN',
    code: 1018,
    message: 'The reset token provided is invalid',
    messageFr: 'french The reset token provided is invalid'
}

export const RESET_TOKEN_DEACTIVED: ErrorResponse = {
    name: 'NOT RESET_TOKEN_DEACTIVED',
    code: 1019,
    message: 'The reset token provided is no longer active',
    messageFr: 'french The reset token provided is no longer active'
}