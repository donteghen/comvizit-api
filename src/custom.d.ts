declare namespace Express {
    export interface User {
        id?: string,
        fullname?: string,
        lang?:string,
        email?: string,
        password?: string,
        phone?: string,
        address?: {
            town?: string,
            quater?: string,
            street?: string
        },
        updated?: number,
        avatar?: string,
        avatarDeleteId?: string,
        approved?: boolean,
        isVerified?: boolean,
        role?: string,
        favorites?:Array<string>
    }
} 