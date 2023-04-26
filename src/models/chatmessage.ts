import {Schema, model} from "mongoose";
import { IChatMessage } from "./interfaces";

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
  },
  {
    timestamps: true
  }
);

const ChatMessage = model('ChatMessage', ChatMessageSchema);
export {ChatMessage}