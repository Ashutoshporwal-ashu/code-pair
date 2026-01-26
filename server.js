import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { ACTIONS } from './src/Actions.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    // 1. JOIN LOGIC
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    // 2. CODE CHANGE LOGIC
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        // Console log hata diya taaki terminal saaf rahe
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // 3. SYNC CODE LOGIC
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // ✨ 4. CHAT MESSAGE LOGIC (Ye Naya Hai)
    socket.on(ACTIONS.SEND_MESSAGE, ({ roomId, message, username }) => {
        // Message poore room mein bhejo (including sender)
        io.to(roomId).emit(ACTIONS.RECEIVE_MESSAGE, {
            username,
            message,
            timestamp: new Date().toLocaleTimeString(),
        });
    });

    // 5. DISCONNECT LOGIC
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});