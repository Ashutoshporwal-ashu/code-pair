import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { ACTIONS } from './src/Actions.js';

const app = express();
const server = http.createServer(app);

// ✨ JSON data padhne ke liye zaroori hai
app.use(express.json());

// ✨ Browser security (CORS) error hatane ke liye
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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

// ✨ API: Check agar Room Exist karta hai
app.get('/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = io.sockets.adapter.rooms.get(roomId);
    
    // Agar room hai aur usme log hain -> exists: true
    if (room && room.size > 0) {
        return res.status(200).json({ exists: true });
    }
    
    // Agar room nahi hai -> exists: false
    return res.status(200).json({ exists: false });
});


io.on('connection', (socket) => {
    // console.log('Socket connected', socket.id);

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
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // 3. SYNC CODE LOGIC
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // 4. CHAT MESSAGE LOGIC
    socket.on(ACTIONS.SEND_MESSAGE, ({ roomId, message, username }) => {
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