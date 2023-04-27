import { IChatMessage } from "./interfaces";

export type Heartbeat = {
    senderId: string,
    chatId: string
}
export interface ServerToClientEventHandles {
    'is_active': (data: Heartbeat) => void ;
    'sent_message': (data: IChatMessage) => void ;
}

export interface ClientToServerEventHandlers {
    'sent_message': (data: IChatMessage, cb: (ack: number) => void) => void ;
    'receive_message': (data: IChatMessage) => void ;
    'heartbeat' : (data: Heartbeat) => void ;
}

export interface InterServerEventHandlers {
    'ping': () => void ;
}


