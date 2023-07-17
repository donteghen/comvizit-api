import {Schema, model} from "mongoose";
import { IIdentityCounter } from "./interfaces";
import { NextFunction } from "express";
/**
 * IdentityCounter schema, represents the document property definition for an IdentityCounter
 * @constructor IdentityCounter
 * @property {string} model - identity's name
 * @property {string} field - identity's target property
 * @property {string} count - identity's current count
 */
const IdentityCounterSchema = new Schema<IIdentityCounter>({
    model: {
      type: String,
      required: true
    },
    field: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true,
      default: 1
    },
  },
  {
    timestamps: true,
  }
);

const IdentityCounter = model('IdentityCounter', IdentityCounterSchema);
export {IdentityCounter};