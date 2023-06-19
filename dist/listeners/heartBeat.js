"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onHeartBeat = void 0;
// import {io} from '../server';
function onHeartBeat(socket, data) {
    console.log(data);
    // do stuff
    // broadcast this socket status to all clients
    // socket.broadcast.emit('is_active', (data))
}
exports.onHeartBeat = onHeartBeat;
//# sourceMappingURL=heartBeat.js.map