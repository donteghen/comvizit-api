import {io} from './server' ;
import {Socket} from 'socket.io'
import { logger } from './logs/logger';
import { IChatMessage } from "./models/interfaces";
import { Heartbeat } from './models/socket-interfaces';


io.on("connection", (socket: Socket) => {
    // handle heartbeat event
    socket.on('heartbeat', (data: Heartbeat) => {
        // do stuff

        // emit the active status of the sender
        io.emit('is_active', (data))
    })


    // disconnection event
    socket.on('disconnect', () => {
        // add logger
        console.log('Server Socket disconnected')
    })
});
