"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const server_1 = require("./server");
Object.defineProperty(exports, "io", { enumerable: true, get: function () { return server_1.io; } });
const heartBeat_1 = require("./listeners/heartBeat");
const incomingMessage_1 = require("./listeners/incomingMessage");
server_1.io.on("connection", (socket) => {
    console.log(`new connection`, socket);
    socket.emit('welcome', 'hi there & welcome');
    // handle heartbeat event handler
    socket.on('heartbeat', function (data) {
        (0, heartBeat_1.onHeartBeat)(socket, data);
    });
    // recieve an outgoing_message event handler
    socket.on('outgoing_message', incomingMessage_1.onOutgoingMessage);
    // disconnection event handler
    socket.on('disconnect', (reason) => {
        // add logger
        console.log(`socket ${socket.id} disconnected due to ${reason}`);
    });
});
//# sourceMappingURL=socketio.js.map