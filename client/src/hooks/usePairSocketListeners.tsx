import { Socket } from "socket.io-client";

export function usePairSocketListeners(
    socket: Socket,
    onSuccess: () => void,
    onFail: (err: unknown) => Promise<void> | void
) {
    let handleConnect: () => void;
    let handleConnectionError: (err: unknown) => void;

    let finished = false;

    handleConnect = () => {
        if (finished) return;
        finished = true;

        socket.off("connect_error", handleConnectionError);
        onSuccess();
    };

    handleConnectionError = (err: unknown) => {
        if (finished) return;
        finished = true;

        socket.off("connect", handleConnect);
        onFail(err);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectionError);
}