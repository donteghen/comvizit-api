import { Types } from 'mongoose';
import { IChatMessage,  } from '../models/interfaces';
import {io} from '../server';
import { ChatMessage } from '../models/chatmessage';
import { logger } from '../logs/logger';
import { User } from '../models/user';
import { Chat } from '../models/chat';
import { constants } from '../constants';

async function onOutgoingMessage(socket: any, data: Omit<IChatMessage, 'unique_id'>) {
    try {

    // save the message
    const newMessage = new ChatMessage({
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
    });
    const message = await newMessage.save();

    // emit the save message to all members of this room.
    io.in(data.chatId).emit('incoming_message', message);

    // get the chat to retreive the sender and receiver ids
    const chat = await Chat.findById(data.chatId)
    // update both sender && receiver
    const now = Date.now()
    const ids = [new Types.ObjectId(chat.tenant), new Types.ObjectId(chat.landlord)]
    await User.updateMany({_id: {$in: ids}}, {lastMessageDate: new Date(now), updated: now});

    } catch (error) {
        logger.error(`An error occur while creating a new message and emiting incoming_message event due to : ${error??"Unrecognized reasons"}`)
        return
    }
}

export {
    onOutgoingMessage
}