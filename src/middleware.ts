import { Request, Response , NextFunction} from "express";

export default function adminAuth (req: Request, res: Response, next: NextFunction) {
    const {ADMIN_AUTH_NAME, ADMIN_AUTH_PASSWORD, ADMIN_AUTH_SECRET} = process.env
    if (req.headers.authname !== ADMIN_AUTH_NAME || req.headers.authpassword !== ADMIN_AUTH_PASSWORD || req.headers.authsecret !== ADMIN_AUTH_SECRET) {
        throw new Error('Authentication Needed!')
    }
    next()
}
