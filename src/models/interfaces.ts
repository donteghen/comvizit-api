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

export type PreferredTenant = {
    age: number,
    genter: string,
    type: string
}

export type Address = {
    town: string,
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
    eletricity: boolean,
    water: boolean,
    internet: boolean,
    maintenance: boolean
}

export interface IContact extends Document {
    fullname: string,
    email: string,
    phone: string,
    replied: boolean
}

export interface IOwner extends Document {
    fullname: string,
    email: string,
    phone: string,
    address: Address
}

export interface IInquiry extends Document {
    fullname: string,
    email: string,
    phone: string,
    message: string,
    replied: boolean,
    subject: string
}

export interface IProperty extends Document {
    ownerId: Types.ObjectId,
    price: number,
    propertyType: string,
    propertSize: number,
    facilities: Types.Array<string>,
    furnishedState: string,
    amenities: Types.Array<string>,
    description: string,
    coords:Coords,
    town: string,
    quater: Quater,
    street: string,
    district: string,
    media: Media,
    rentSummary: RentSummary,
    rules: Types.Array<string>,
    preferedTenant: PreferredTenant,
    distanceFromRoad:number,
    costFromRoad: number,
    availability: string,
    rentUtilities: RentUtilities
}