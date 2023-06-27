import { IChatMessage } from "./interfaces";
import { Socket } from "socket.io";

export type Heartbeat = {
    senderId: string
}
export interface ServerToClientEventHandles {
    'is_active': (data: Heartbeat) => void ;
    'outgoing_message': (data: IChatMessage, ) => void ;
    'incoming_message': (data: IChatMessage) => void ;
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


