import { kStringMaxLength } from 'buffer';
import { Document, Types } from 'mongoose';

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

export interface IComplain {
    target: string,
    subject: string,
    message: string,
    fullname: string,
    email: string,
    phone: string,
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

export interface IOwner extends Document {
    fullname: string,
    lang:string,
    email: string,
    phone: string,
    address: Address,
    updated: number,
    avatar?: string,
    avatarDeleteId?: string
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
    coords:Coords,
    town: string,
    quater: Quater,
    street: string,
    district: District,
    media?: Media,
    rentSummary: RentSummary,
    rules: Types.Array<string>,
    preferedTenant: PreferredTenant,
    distanceFromRoad:number,
    costFromRoad: number,
    availability: string,
    rentUtilities: RentUtilities
}

export interface IAdmin extends Document {
    username: string,
    email: string,
    password: string,
    approved: boolean
}

// export interface IAdminMethods {
//     fullName(): string;
//   }