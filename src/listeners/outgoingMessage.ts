import { IChatMessage,  } from '../models/interfaces';
import {io} from '../server';
import { ChatMessage } from '../models/chatmessage';


async function onOutgoingMessage(data: IChatMessage) {
    // save the message
    const newMessage = new ChatMessage({
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
    });
    await newMessage.save();
    // emit the save message to all members of this room.
    io.in(data.chatId).emit('incoming_message', data);
}


export {
    onOutgoingMessage
}