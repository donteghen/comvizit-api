import { IChatMessage,  } from '../models/interfaces';
import {io} from '../server';
import { ChatMessage } from '../models/chatmessage';


async function onOutgoingMessage(data: Omit<IChatMessage, 'unique_id'>) {
    console.log(data)
    // save the message
    const newMessage = new ChatMessage({
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
    });
    const mes = await newMessage.save();
    console.log('Firing a new message by: ', mes.senderId, 'to : ', mes.content)
    // emit the save message to all members of this room.
    io.in(data.chatId).emit('incoming_message', mes);
}


export {
    onOutgoingMessage
}