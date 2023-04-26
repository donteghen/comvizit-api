"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
server_1.io.on("connection", (socket) => {
    // handle heartbeat event
    socket.on('heartbeat', (data) => {
        // do stuff
        // emit the active status of the sender
        server_1.io.emit('is_active', (data));
    });
    // disconnection event
    socket.on('disconnect', () => {
        // add logger
        console.log('Server Socket disconnected');
    });
});
//# sourceMappingURL=socketio.js.map