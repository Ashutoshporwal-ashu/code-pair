import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity', // Baar baar try karega agar connection tute
        timeout: 10000,
        transports: ['websocket'],
    };
    // Backend ka URL (Port 5000)
    return io('https://code-pair-d9hg.onrender.com', options);
};