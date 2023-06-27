import { IChatMessage } from '../models/interfaces';
import {io} from '../server';


function onOutgoingMessage(data: IChatMessage) {
    console.log("New message to be sent with the following data: ")
    io.in(data.chatId).emit('incoming_message', data)
    // save the message

    // emit the save message to all members of this room.
    // io.emit('incoming_message', data)
}


export {
    onOutgoingMessage
}