import {Schema, model} from "mongoose";
import { IChat } from "./interfaces";
import { NextFunction } from "express";
/**
 * Chat schema, represents the document property definition for a chat
 * @constructor Chat
 * @param {Array<String>} members - The list of all members within a chat
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
      // check if it is a document
      if (doc.isNew) {
          const collectionCount = await Chat.countDocuments();
          doc.unique_id = collectionCount + 1
      }
      next()

  } catch (error) {
      next(error)
  }
})
const Chat = model('Chat', ChatSchema);
export {Chat};