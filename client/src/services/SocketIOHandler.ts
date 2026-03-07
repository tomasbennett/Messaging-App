import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { domain } from "../constants/EnvironmentAPI";


export class SocketIOHandler {
    private socket: Socket | null = null;

    constructor() {
        this.initializeSocket();
    }

    private initializeSocket() {
        this.socket = io(`${domain}`, {
            withCredentials: true,
        });

        this.socket.on("connect", () => {
            console.log("Connected to Socket.IO server", this.socket?.id);
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from Socket.IO server");
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }
}
