import {Schema, model} from "mongoose";
import { IChatMessage } from "./interfaces";
import { NextFunction } from "express";
import { IdentityCounter } from "./identity-counter";


/**
 * Chat-message schema, represents the document property definition for a chat-message
 * @constructor Chat
 * @property {string} chatId - the id of the chat containing the chat message
 * @property {string} senderId - the user who sent the message
 * @property {string} content - message it self
 * @property {number} unique_id - Unique Id
 */
const ChatMessageSchema = new Schema<IChatMessage>({
    chatId: {
      type: String,
      required: true
    },
    senderId: {
      type: String,
      required: true
    },
    content: {
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
    timestamps: true
  }
);

ChatMessageSchema.pre('validate', async function (next: NextFunction) {
  try {
    let doc = this;
    // check if it is a new document
    if (doc.isNew) {
      const identity = await IdentityCounter.findOne({model: 'chat-message'});
      if (identity) {
        identity.count = identity.count + 1 ;
        const updatedIdentity =  await identity.save();
        doc.unique_id = updatedIdentity.count;
        next();
      }
      else {
        const identityDocument = new IdentityCounter({
          model: 'chat-message',
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
const ChatMessage = model('ChatMessage', ChatMessageSchema);
export {ChatMessage}