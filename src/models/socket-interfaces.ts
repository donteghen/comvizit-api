import { IChatMessage } from "./interfaces";
import { Socket } from "socket.io";

export type Heartbeat = {
    senderId: string,
    chatId: string
}
export interface ServerToClientEventHandles {
    'is_active': (socket: Socket, data: Heartbeat) => void ;
    'outgoing_message': (socket: Socket, data: IChatMessage, ) => void ;
    'incoming_message': (socket: Socket, data: IChatMessage) => void ;
    'disconnect': () => void;
}

export interface ClientToServerEventHandlers {
    'outgoing_message': (data: IChatMessage) => void ;
    'heartbeat' : (data: Heartbeat) => void ;
    'disconnect': () => void;
}

export interface InterServerEventHandlers {
    'ping': () => void ;
}


