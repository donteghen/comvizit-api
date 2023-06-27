
import { Heartbeat } from '../models/socket-interfaces';


function onHeartBeat (socket: any, data: Heartbeat) {
    console.log('This a heartbeat data', data)
    // do stuff

    // broadcast this socket status to all clients
    socket.emit('is_active', data)
}

export {
    onHeartBeat
}