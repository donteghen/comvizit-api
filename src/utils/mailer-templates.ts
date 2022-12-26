////////////////////////// ------User Related ------/////////////////////////////////

export const verifyAccountTemplate = {
    subject: 'Account verification',
    heading: 'Account Verification',
    detail:'Please follow the link below to verify your account in order to complete your registration procedure.<br><strong>Visit the link to verify your account</strong>',
    linkText: 'Verify'
}
export const notifyAccountCreated = {
    subject: 'New Account Added',
    heading: 'A New User Joined the Platform',
    detail:'A new user recently registered and the account is pending verification<br><strong>Visit the admin dashboard for follow-up</strong>',
    linkText: 'Go to Admin Dashboard'
}

export const welcomeTemplate = {
subject: 'Welcome to Comvizit',
heading: 'Welcome to Comvizit, the one of a kind property rental platform',
detail:'Thanks for verifying your account. You account registration is now completely, so you may start enjoying the features.<br/> <strong>Visit your profile</strong>',
linkText: 'Go to Platform'
}

export const notifyAccountVerified = {
subject: 'New Account Verification',
heading: 'Update On Account Verifcation',
detail:'A new user recently verified their account<br><strong>Visit the admin dashboard for follow-up</strong>',
linkText: 'Go to Admin Dashboard'
}

export const notifyAccountApproved = {
    subject: 'Account Approval Status Update',
    heading: 'Account Approval Status Update',
    detail:'Congratulations! Your account has been approved.<br><strong>You now have access all provided features.</strong>',
    linkText: 'Visit your profile'
    }

////////////////////////// ------Property Related ------/////////////////////////////////

// export const notifyProjectCreated = {
// subject: 'New Project Added',
// heading: 'Project Creation Update',
// detail:'A new project has been added by a user<br><strong>Visit the admin dashboard for follow-up</strong>',
// linkText: 'Go to Admin Dashboard'
// }

export const notifyPropertyDeleted = (userEmail:string, propertyId:string) => {
    return {
        subject: 'Property Deleted',
        heading: 'Property Deletion Update',
        detail:`The Property with ID:<strong>${propertyId}</strong> has been deleted by ${userEmail}<br><strong>Visit the admin dashboard for follow-up</strong>`,
        linkText: 'Go to Admin Dashboard'
    }
}

// export const notifyProjectPlanUpgraded = (userName:string, projectName:string, projectId:string, newPlan:string) => {
// return {
//     subject: 'Project Plan Upgrade',
//     heading: 'Your Project Plan Updates',
//     detail:`Dear ${userName}<br/><br/> Your project named: ${projectName} with id:<strong>${projectId}</strong> has been upgraded to ${newPlan}<br><strong>Visit your dashboard to confirm, thanks!</strong>`,
//     linkText: 'Visit Dashboard'
// }
// }

export const notifyPropertyAvailability = (userName: string, propertyId: string, availabilityStatus: string) => {
    return {
        subject: 'Property Availability Status',
        heading: 'Your Property Availability Status Update',
        detail:`Dear ${userName}<br/><br/> Your property with ID:<strong>${propertyId}</strong> has been marked as ${availabilityStatus}<br><strong>Visit your dashboard to confirm, thanks!</strong>`,
        linkText: 'Visit Dashboard'
    }
}

// export const notifyProjectActivated = (userName:string, projectName:string, projectId:string) => {
// return {
//     subject: 'Property Active State Changed',
//     heading: 'Property Is Active',
//     detail:`Dear ${userName}<br/><br/> Your project named: ${projectName} with id:<strong>${projectId}</strong> has been activated. You will start recieving project reports<br><strong>Visit your dashboard to confirm, thanks!</strong>`,
//     linkText: 'Go To Dashboard'
// }
// }

// export const notifyProjectDeactivated = (userName:string, projectName:string, projectId:string) => {
// return {
//     subject: 'Project Active State Changed',
//     heading: 'Project Is Not Active',
//     detail:`Dear ${userName}<br/><br/> Your project named: ${projectName} with id:<strong>${projectId}</strong> has been deactivated. You will not longer be recieving project reports.<br><strong>Contact the support team to sort out the issue</strong>`,
//     linkText: 'Contact Support'
// }
// }


////////////////////////// ------Inquiry Related ------/////////////////////////////////

// export const notifyReportDisptached = (userName:string, projectName:string, projectId:string) => {
// return {
//     subject: 'Project Report Update',
//     heading: ' This Project\'s Latest Report Is Ready',
//     detail:`Dear ${userName}<br/><br/> There is a new report for your project named: ${projectName} <br/>Id:<strong>${projectId}</strong>.<br/>As per your project plan or in respond to an on-demand report, a new report has been created and upload to your dashboard. <strong>Click on the button below to go to your dahsboard</strong>.<br>`,
//     linkText: 'Visit Dashboard'
// }
// }
////////////////////////// ------Complaint Related ------/////////////////////////////////

export const notifyNewComplained= {
    subject: 'New Complain Recieved',
    heading: 'New Complain Recieved',
    detail:`Dear Admin<br/><br/> A new complain has been sent concerning a landlord / property.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
    linkText: 'Go To Dashboard'
}

////////////////////////// ------Contact Related ------/////////////////////////////////

export const notifyNewInquiry = {
    subject: 'New Inquiry Message',
    heading: 'Inquiry Msssage Update',
    detail:`Dear Admin<br/><br/> A new inquiry has been sent by a potential landlord / tenant/ partner.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
    linkText: 'Go To Dashboard'
}

export const notifyNewContactMe = {
    subject: 'New Contact Me Request',
    heading: 'Contact Me Request',
    detail:`Dear Admin<br/><br/> A new contact-me-back message has been sent by a potential landlord / tenant/ partner.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
    linkText: 'Go To Dashboard'
}

////////////////////////// ------Project Request Related ------/////////////////////////////////

// export const notifyNewPropertyRequest = (userName: string, projectName: string, projectId: string) => {
// return {
//     subject: 'Project Request Updates',
//     heading: 'New Project Request',
//     detail:`Dear Admin<br/><br/>A new request has been made<br/>By: <strong>${userName}</strong><br/>For project named: <strong>${projectName}</strong><br/> ID: <strong>${projectId}</strong>.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
//     linkText: 'Follow Up Now'
// }
// }

// export const notifyProjectRequestStatusChanged = (userName:string, projectName:string, projectId:string, newStatus:string) => {
// return {
//     subject: 'Project Request Updates',
//     heading: 'New Project Request',
//     detail:`Dear ${userName}<br/><br/>Your request with regards to the project named: <strong>${projectName}</strong>, ID: <strong>${projectId}</strong> ${newStatus === 'IN_PROGRESS' ? 'is in progress' : 'has been processed'}.<br/><strong>Please visit the dashboard to confirm, thanks!</strong>.`,
//     linkText: 'Continue to Dashboard'
// }
// }

////////////////////////// ------Testimonials Related ------/////////////////////////////////

// export const notifyNewtestimonialAdded = () => {
// return {
//     subject: 'Testimonials Update',
//     heading: 'Latest on Testimonials',
//     detail:'Dear Admin<br/><br/>A new testimonial has been added. <strong>Please visit the dashboard to confirm</strong>',
//     linkText: 'Visit Dashboard Now'
// }
// }

/////////////////////////// ------Testimonials Related ------/////////////////////////////////

// export const confirmPaymentReceived = (userName:string, projectName: string, projectPlan:string, ) => {
// return {
//     subject: 'Project Plan Payment Confirmation',
//     heading: 'Project Plan Payment Updates',
//     detail:`Dear ${userName}<br/><br/> Thanks for your recent payment.<br/><br/>This is to confirm that your payment for the project: <strong>${projectName}</strong>, on <strong>${projectPlan} Plan</strong> has been successfully received and processed.<br/><strong>Please visit profile setting's payment page for details, thanks!</strong>.`,
//     linkText: 'Visit Your Profile Now'
// }
// }

// export const confirmPaymentRefund = (userName:string, projectName: string, projectPlan:string, ) => {
// return {
//     subject: 'Project Plan Payment Refund Confirmation',
//     heading: 'Project Plan Payment Refund Updates',
//     detail:`Dear ${userName}<br/><br/>This is to confirm that your recent payment made for the project: <strong>${projectName}</strong>, on <strong>${projectPlan} Plan</strong> has been successfully refunded.<br/><strong>Please visit profile setting's payment page for details or contact the support team if there are any issues with the refund thanks!</strong>.`,
//     linkText: 'Visit Your Profile Now'
// }
// }