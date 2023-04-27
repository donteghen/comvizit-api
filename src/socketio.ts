import {io} from './server' ;
import {Socket} from 'socket.io'
import { logger } from './logs/logger';
import { IChatMessage } from "./models/interfaces";
import { Heartbeat } from './models/socket-interfaces';
import { Chat } from './models/chat';
import { ChatMessage } from './models/chatmessage';
import { User } from './models/user';

io.on("connection", (socket: Socket) => {
    // handle heartbeat event handler
    socket.on('heartbeat', (data: Heartbeat) => {
        // do stuff

        // emit the active status of the sender
        io.emit('is_active', (data))
    })

    // sent_message event handler
    socket.on('sent_message', (data: IChatMessage, cb) => {
        console.log("New message arrived : line 21", data)
        io.emit('sent_message', data)
        cb({
            ok: true
        })
    })

    // disconnection event handler
    socket.on('disconnect', () => {
        // add logger
        console.log('Server Socket disconnected')
    })
});
