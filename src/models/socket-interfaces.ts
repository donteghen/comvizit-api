import { IChatMessage } from "./interfaces";

export type Heartbeat = {
    senderId: string,
    chatId: string
}
export interface ServerToClientEventHandles {
    'is_active': (data: Heartbeat) => void ;
}

export interface ClientToServerEventHandlers {
    'sent_message': (data: IChatMessage, cb: (ack: number) => void) => void ;
    'heartbeat' : (data: Heartbeat) => void ;
}

export interface InterServerEventHandlers {
    'ping': () => void ;
}


