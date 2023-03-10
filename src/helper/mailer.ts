import sgMail from '@sendgrid/mail'
import { logger } from '../logs/logger'
import {mailerHtml} from '../utils/mailer-html'


export interface MailResponse {
    ok:boolean,
    error: string,
    message: string
}


const mailer = async (toEmail: string, subject: string, heading: string, detail: string, link?: string, linkText?:string) => {

    try {
        // let mailresponse: MailResponse
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
        to: `${toEmail}`, // Change to your recipient
        from: `${process.env.SENDGRID_VERIFIED_SENDER}`, // Change to your verified sender
        subject: `${subject}`,
        text: `${heading}/n/n ${detail}`,
        html: mailerHtml(heading, detail, link, linkText),
        }
        await sgMail.send(msg)
        return {
            ok:true,
            error: '',
            message: 'Successfuly send!'
        }

    } catch (error) {
        logger.error(`The Email to ${toEmail} with subject: ${subject} failed due to ${error?.message??'Unknown mailer error'}`)
        return  {
            ok:false,
            error: error.response.body,
            message: ''
        }

    }

}
export {mailer}