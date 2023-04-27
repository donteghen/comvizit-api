"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
server_1.io.on("connection", (socket) => {
    // handle heartbeat event handler
    socket.on('heartbeat', (data) => {
        // do stuff
        // emit the active status of the sender
        server_1.io.emit('is_active', (data));
    });
    // sent_message event handler
    socket.on('sent_message', (data, cb) => {
        console.log("New message arrived : line 21", data);
        server_1.io.emit('sent_message', data);
        cb({
            ok: true
        });
    });
    // disconnection event handler
    socket.on('disconnect', () => {
        // add logger
        console.log('Server Socket disconnected');
    });
});
//# sourceMappingURL=socketio.js.map