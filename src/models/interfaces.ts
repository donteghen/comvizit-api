import { Document, Types } from 'mongoose';

export type ErrorResponse = {
    name: string,
    code: number,
    message: string,
    messageFr: string
}
export type SuccessResponse = {
    message: string,
    messageFr: string
}

export type PropertyVideo = {
    title: string,
    src: string
}

export type PropertyVirtual = {
    title: string,
    src: string
}
export type Coords = {
    lat: number,
    log: number
}

export type Quater = {
    name: string,
    ref: string
}

export type District = {
    name: string,
    ref: string
}

export type PreferredTenant = {
    gender: string,
    type: string
}

export type Address = {
    town: string,
    quater: string,
    street: string
}

export type Media = {
    photos?: Types.Array<string>,
    virtualTours?: Types.Array<PropertyVirtual>,
    videos?: Types.Array<PropertyVideo>
}

export type RentSummary = {
    initialRent: number,
    commission: number,
    deposit: number
}

export type RentUtilities = {
    electricity: boolean,
    water: boolean,
    internet: boolean,
    maintenance: boolean
}

export type BookingSummary = {
    fee: number,
    cancelationFee: number,
    paymentMethods: Types.Array<string>,
    maxDuration: number
}

export interface IComplain {
    targetId: Types.ObjectId,
    type: string,
    plaintiveId: Types.ObjectId,
    subject: string,
    message: string,
    processed: boolean,
    updated: number
}

export interface IContact extends Document {
    fullname: string,
    email: string,
    phone: string,
    replied: boolean,
    updated: number
}

export interface IInquiry extends Document {
    fullname: string,
    email: string,
    phone: string,
    message: string,
    replied: boolean,
    subject: string,
    updated: number
}

export interface IProperty extends Document {
    ownerId: Types.ObjectId,
    age: number,
    price: number,
    propertyType: string,
    updated: number,
    bedroom?: string,
    propertySize: number,
    facilities: Types.Array<string>,
    furnishedState: string,
    amenities: Types.Array<string>,
    features?: Types.Array<string>,
    description: string,
    descriptionFr:string,
    coords:Coords,
    town: string,
    quater: Quater,
    street: string,
    district: District,
    media?: Media,
    rentSummary: RentSummary,
    bookingsummary: BookingSummary,
    rules: Types.Array<string>,
    preferedTenant: PreferredTenant,
    distanceFromRoad:number,
    costFromRoad: number,
    availability: string,
    rentUtilities: RentUtilities,
    likes?:string[],
    rentIntensions?: string[],
    featuring: boolean
}

export interface IUser extends Document {
    fullname: string,
    lang:string,
    email: string,
    password: string,
    phone: string,
    gender: string,
    address: Address,
    updated: number,
    avatar?: string,
    avatarDeleteId?: string,
    approved: boolean,
    isVerified: boolean,
    role: string,
    favorites?: string[],
    likes?:string[],
    rentIntensions?: string[]
}

export interface IFeaturedProperties extends Document {
    propertyId: Types.ObjectId,
    duration: number,
    startedAt: number,
    status: string
}

export interface ITag extends Document {
    type: string,
    title: string,
    code: string,
    status: string,
    refId: Types.ObjectId,
    createdDate: number,
    updated: number
}

export interface IToken extends Document {
    owner: Types.ObjectId,
    secret: string,
    generatedAt: number
}

export interface IReview extends Document {
    type: string,
    author: Types.ObjectId,
    authorType: string,
    rating: number,
    comment: string,
    status: string,
    refId: string
}
export interface IFavorite extends Document {
    propertyId: Types.ObjectId,
    userId: Types.ObjectId
}

export interface ILike extends Document {
    propertyId: Types.ObjectId,
    likerId: Types.ObjectId
}

export interface IRentIntention extends Document {
    propertyId: Types.ObjectId,
    landlordId: Types.ObjectId,
    potentialTenantId: Types.ObjectId,
    comment: string,
    status: string,
    initiatedAt: number
}

export interface IRentalHistory extends Document {
    propertyId: Types.ObjectId,
    landlordId: Types.ObjectId,
    tenantId: Types.ObjectId,
    startDate: number,
    endDate: number,
    status: string,
    rentIntentionId: Types.ObjectId
}

export interface ILog extends Document {
    timestamp: Date,
    level: string,
    message: string,
    meta: any
}