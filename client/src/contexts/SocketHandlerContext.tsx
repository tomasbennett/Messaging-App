import React, { useContext, useEffect } from "react";
import { Socket } from "socket.io-client";
import { SocketIOHandler } from "../services/SocketIOHandler";

export const SocketContext = React.createContext<Socket | null>(null);


export type ISocketProviderContext = Socket | null;


export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {

    const [socket, setSocket] = React.useState<Socket | null>(null);



    useEffect(() => {

        const socketInstance = new SocketIOHandler();
        setSocket(socketInstance.getSocket());

        return () => {
            socketInstance.disconnect();
        };
    }, []);


    const ctx: ISocketProviderContext = socket;


    return (
        <SocketContext.Provider value={ctx}>
            {children}
        </SocketContext.Provider>
    );
};



export function useSocket() {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error("Socket not available");
  }

  return socket;
}