"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOutgoingMessage = void 0;
const server_1 = require("../server");
function onOutgoingMessage(data) {
    console.log("New message to be sent with the following data: ", data);
    server_1.io.emit('incoming_message', data);
    // save the message
    // emit the save message to all members of this room.
    // io.emit('incoming_message', data)
}
exports.onOutgoingMessage = onOutgoingMessage;
//# sourceMappingURL=outgoingMessage.js.map