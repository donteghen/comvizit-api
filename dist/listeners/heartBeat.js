"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onHeartBeat = void 0;
function onHeartBeat(socket, data) {
    console.log('This a heartbeat data', data);
    // do stuff
    // broadcast this socket status to all clients
    socket.emit('is_active', data);
}
exports.onHeartBeat = onHeartBeat;
//# sourceMappingURL=heartBeat.js.map