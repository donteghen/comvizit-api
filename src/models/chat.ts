import {Schema, model} from "mongoose";
import { IChat } from "./interfaces";
import { NextFunction } from "express";
import { IdentityCounter } from "./identity-counter";


/**
 * Chat schema, represents the document property definition for a chat
 * @constructor Chat
 * @property {string} tenant - tenant user
 * @property {string} landlord - landlord user
 * @property {number} unique_id - Unique Id
 */
const ChatSchema = new Schema<IChat>({
    tenant: {
      type: String,
      required: true
    },
    landlord: {
      type: String,
      required: true
    },
    unique_id: {
      type: Number,
      required: true,
      unique: true
    },
  },
  {
    timestamps: true,
  }
);

ChatSchema.pre('validate', async function (next: NextFunction) {
  try {
    let doc = this;
    // check if it is a new document
    if (doc.isNew) {
      const identity = await IdentityCounter.findOne({model: 'chat'});
      if (identity) {
        identity.count = identity.count + 1 ;
        const updatedIdentity =  await identity.save();
        doc.unique_id = updatedIdentity.count;
        next();
      }
      else {
        const identityDocument = new IdentityCounter({
          model: 'chat',
          field: 'unique_id'
        }) ;
        doc.unique_id = identityDocument.count;
        next();
      }
    }

  } catch (error) {
      next(error)
  }
})
const Chat = model('Chat', ChatSchema);
export {Chat};