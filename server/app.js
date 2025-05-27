require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = 3050;

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:5173", // Allow localhost for dev environment
            "http://192.168.1.5:5173", // Allow local IP for other devices
        ],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true, // Allow cookies & authentication headers
    })
);
app.use(express.json());

// Create HTTP server to attach Socket.IO
const server = http.createServer(app);

// Attach Socket.IO to the server
const io = socketIo(server, {
    cors: {
        origin: [
            "http://localhost:5173", // Allow localhost for dev environment
            "http://192.168.1.5:5173", // Allow local IP for other devices
        ],
        methods: "GET,POST",
        credentials: true, // Allow cookies & authentication headers
    }
});

// Import and use routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const gamersRoutes = require('./routes/gamers');

app.use('/', authRoutes);
app.use('/', roomRoutes);
app.use('/', gamersRoutes);

// Import socket events and pass the `io` instance for gamer count events
const socketGamerCountEvents = require('./routes/socketGamerCountEvents');
socketGamerCountEvents(io);

// Import socket events and pass the `io` instance for gamer count events
const socketGamerDataEvents = require('./routes/socketGamerDataEvents');
socketGamerDataEvents(io);

// Start the server with both Express and Socket.IO
server.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`);
});
