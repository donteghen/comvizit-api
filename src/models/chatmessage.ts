import {Schema, model} from "mongoose";
import { IChatMessage } from "./interfaces";
import { NextFunction } from "express";

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
      // check if it is a document
      if (doc.isNew) {
          const collectionCount = await ChatMessage.countDocuments();
          doc.unique_id = collectionCount + 1
      }
      next()

  } catch (error) {
      next(error)
  }
})
const ChatMessage = model('ChatMessage', ChatMessageSchema);
export {ChatMessage}