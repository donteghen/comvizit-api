import { Socket } from 'socket.io';
import { Heartbeat } from '../models/socket-interfaces';
// import {io} from '../server';


function onHeartBeat (socket: Socket, data: Heartbeat) {
    console.log(data)
    // do stuff

    // broadcast this socket status to all clients
    // socket.broadcast.emit('is_active', (data))
}

export {
    onHeartBeat
}