import {Schema, model} from "mongoose";
import { IChat } from "./interfaces";
/**
 * Chat schema, represents the document property definition for a chat
 * @constructor Chat
 * @param {Array<String>} members - The list of all members within a chat
 */
const ChatSchema = new Schema<IChat>({
    members: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Chat = model('Chat', ChatSchema);
export {Chat};