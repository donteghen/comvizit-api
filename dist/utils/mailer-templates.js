"use strict";
////////////////////////// ------User Related ------/////////////////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyRentalHistoryTerminatedToTenant = exports.notifyRentalHistoryTerminatedToLandlord = exports.notifyRentalHistoryCreatedToTenant = exports.notifyRentalHistoryCreatedToLandlord = exports.notifyRentIntentionToLandlord = exports.notifyNewRentIntentionToAdmin = exports.notifyNewContactMe = exports.notifyNewInquiry = exports.notifyNewComplained = exports.notifyPropertyAvailability = exports.notifyPropertyDeleted = exports.notifyAccountDisapproved = exports.notifyAccountApproved = exports.notifyAccountVerified = exports.welcomeTemplate = exports.notifyAccountCreated = exports.verifyAccountTemplate = void 0;
exports.verifyAccountTemplate = {
    subject: 'Account verification',
    heading: 'Account Verification',
    detail: 'Please follow the link below to verify your account in order to complete your registration procedure.<br><strong>Visit the link to verify your account</strong>',
    linkText: 'Verify'
};
exports.notifyAccountCreated = {
    subject: 'New Account Added',
    heading: 'A New User Joined the Platform',
    detail: 'A new user recently registered and the account is pending verification<br><strong>Visit the admin dashboard for follow-up</strong>',
    linkText: 'Go to Admin Dashboard'
};
exports.welcomeTemplate = {
    subject: 'Welcome to Comvizit',
    heading: 'Welcome to Comvizit, the one of a kind property rental platform',
    detail: 'Thanks for verifying your account. Your account registration is now completely, so you may start enjoying the features.<br/> <strong>Visit your profile</strong>',
    linkText: 'Go to Platform'
};
exports.notifyAccountVerified = {
    subject: 'New Account Verification',
    heading: 'Update On Account Verifcation',
    detail: 'A new user recently verified their account<br><strong>Visit the admin dashboard for follow-up</strong>',
    linkText: 'Go to Admin Dashboard'
};
exports.notifyAccountApproved = {
    subject: 'Account Approval Status Update',
    heading: 'Account Approval Status Update',
    detail: 'Congratulations! Your account has been approved.<br><strong>You may login now and access all our provided features.</strong>',
    linkText: 'Visit your profile'
};
exports.notifyAccountDisapproved = {
    subject: 'Account Dispproval Update',
    heading: 'Account Dispproval',
    detail: 'Warning! Your account has been temporarily disapproved.<br><strong>Please contact supprot to follow up with the issue.</strong>',
    linkText: 'Visit your profile'
};
////////////////////////// ------Property Related ------/////////////////////////////////
const notifyPropertyDeleted = (userEmail, propertyId) => {
    return {
        subject: 'Property Deleted',
        heading: 'Property Deletion Update',
        detail: `The Property with ID:<strong>${propertyId}</strong> has been deleted by ${userEmail}<br><strong>Visit the admin dashboard for follow-up</strong>`,
        linkText: 'Go to Admin Dashboard'
    };
};
exports.notifyPropertyDeleted = notifyPropertyDeleted;
const notifyPropertyAvailability = (userName, propertyId, availabilityStatus) => {
    return {
        subject: 'Property Availability Status',
        heading: 'Property Availability Status Update',
        detail: `Dear ${userName},<br/><br/> The property with ID:<strong>${propertyId}</strong> has been marked as ${availabilityStatus}<br><strong>Visit your account to confirm, thanks!</strong>`,
        linkText: 'Visit Dashboard'
    };
};
exports.notifyPropertyAvailability = notifyPropertyAvailability;
////////////////////////// ------Complaint Related ------/////////////////////////////////
exports.notifyNewComplained = {
    subject: 'New Complain Recieved',
    heading: 'New Complain Recieved',
    detail: `Dear Admin,<br/><br/> A new complain has been sent concerning a landlord / property.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
    linkText: 'Go To Dashboard'
};
////////////////////////// ------Contact Related ------/////////////////////////////////
exports.notifyNewInquiry = {
    subject: 'New Inquiry Message',
    heading: 'Inquiry Msssage Update',
    detail: `Dear Admin,<br/><br/> A new inquiry has been sent by a potential landlord / tenant/ partner.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
    linkText: 'Go To Dashboard'
};
exports.notifyNewContactMe = {
    subject: 'New Contact Me Request',
    heading: 'Contact Me Request',
    detail: `Dear Admin,<br/><br/> A new contact-me-back message has been sent by a potential landlord / tenant/ partner.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
    linkText: 'Go To Dashboard'
};
////////////////////////// ------RentIntention Related ------/////////////////////////////////
exports.notifyNewRentIntentionToAdmin = {
    subject: 'New Rent Intention Iniatiated',
    heading: 'Rent Intension Update',
    detail: `Dear Admin,<br/><br/> A rent intentension has been initiated by a potential tenant.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
    linkText: 'Go To Dashboard'
};
const notifyRentIntentionToLandlord = (lordLordName) => {
    return {
        subject: 'New Rent Intension Iniatiated',
        heading: 'Rent Intension Update',
        detail: `Dear ${lordLordName},<br/><br/> A rent initension has been initiated by a potential tenant.<br/><strong>Please visit your profile activity to follow that up with the request.</strong>.`,
        linkText: 'Visit Your Profile'
    };
};
exports.notifyRentIntentionToLandlord = notifyRentIntentionToLandlord;
////////////////////////// ------Rental History Related ------/////////////////////////////////
const notifyRentalHistoryCreatedToLandlord = (lordLordName) => {
    return {
        subject: 'New Rental Histoy',
        heading: 'Rental Histoy Record Update',
        detail: `Dear ${lordLordName},<br/><br/> A rental history has been created in line with your current rental lease.<br/><strong>Note: Please don/'t forget to inform us whenever this current property is vacated or rent contract is terminated, so that we will in turn update this record accordingly.</strong>.<br/>You can consult your profile to see the new record by clicking the button`,
        linkText: 'Visit Your Profile'
    };
};
exports.notifyRentalHistoryCreatedToLandlord = notifyRentalHistoryCreatedToLandlord;
const notifyRentalHistoryCreatedToTenant = (tenantName) => {
    return {
        _subject: 'New Rental Histoy',
        _heading: 'Rental Histoy Record Update',
        _detail: `Dear ${tenantName},<br/><br/> A rental history has been created in line with your current rental agreement.<br/><strong>Note: Please don/'t forget to inform us whenever you vacate this property or decide to terminated the rental contract for any reason, so that we will inturn update this record accordingly.</strong>.<br/>You can consult your profile to see the new record by clicking the button`,
        _linkText: 'Visit Your Profile'
    };
};
exports.notifyRentalHistoryCreatedToTenant = notifyRentalHistoryCreatedToTenant;
const notifyRentalHistoryTerminatedToLandlord = (lordLordName) => {
    return {
        subject: 'Rental Histoy Termination',
        heading: 'Rental Histoy Termination Update',
        detail: `Dear ${lordLordName},<br/><br/> Your rental history has been terminated.<br/><strong>Thank you one more for choosing us!</strong>.<br/>You can confirm by visiting your account page`,
        linkText: 'Visit Profile Now'
    };
};
exports.notifyRentalHistoryTerminatedToLandlord = notifyRentalHistoryTerminatedToLandlord;
const notifyRentalHistoryTerminatedToTenant = (tenantName) => {
    return {
        _subject: 'Rental Histoy Termination',
        _heading: 'Rental Histoy Termination Update',
        _detail: `Dear ${tenantName},<br/><br/> Your rental history has been terminated.<br/><strong>Thank you one more for choosing us!</strong>.<br/>If you are currently searching for another place, then click the search now link`,
        _linkText: 'Search Now'
    };
};
exports.notifyRentalHistoryTerminatedToTenant = notifyRentalHistoryTerminatedToTenant;
//# sourceMappingURL=mailer-templates.js.map