import { IChatMessage,  } from '../models/interfaces';
import {io} from '../server';
import { ChatMessage } from '../models/chatmessage';
import { logger } from '../logs/logger';

async function onOutgoingMessage(socket: any, data: Omit<IChatMessage, 'unique_id'>) {
    try {

    // save the message
    const newMessage = new ChatMessage({
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
    });
    const message = await newMessage.save();
    console.log('Firing a new message by: ', message.senderId, 'to : ', message.content)
    console.log('this socket info', socket.rooms, socket.id, socket.sids)
    // emit the save message to all members of this room.
    io.in(data.chatId).emit('incoming_message', message);
    socket.to(data.chatId).emit('incoming_message', message)
    } catch (error) {
        logger.error(`An error occur while creating a new message and emiting incoming_message event due to : ${error??"Unrecognized reasons"}`)
        return
    }
}

export {
    onOutgoingMessage
}