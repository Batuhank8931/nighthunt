const path = require("path");
const fs = require("fs");

module.exports = (io) => {
    const filePath = path.join(__dirname, "../jsons/gamers.json");

    fs.watch(filePath, (eventType, filename) => {
        if (eventType === "change") {
            console.log(`File ${filename} has been updated, updating gamer count...`);

            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading file:", err);
                    return;
                }

                try {
                    const jsonData = JSON.parse(data);

                    if (Array.isArray(jsonData)) {
                        // Group gamers by roomid and count them
                        const roomCounts = jsonData.reduce((acc, gamer) => {
                            const roomid = gamer.roomid;
                            acc[roomid] = (acc[roomid] || 0) + 1;
                            return acc;
                        }, {});

                        // Emit gamer count for each room
                        Object.keys(roomCounts).forEach((roomid) => {
                            io.to(roomid).emit("gamerCount", roomCounts[roomid], roomid);
                            console.log(`Emitted gamer count for room ${roomid}: ${roomCounts[roomid]}`);
                        });
                    }
                } catch (err) {
                    console.error("Error parsing JSON:", err);
                }
            });
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // Handle user joining a room
        socket.on("joinRoom", (roomid) => {
            socket.join(roomid);
            console.log(`User ${socket.id} joined room: ${roomid}`);
        });

        // Handle messages
        socket.on("sendMessage", ({ message, roomid }) => {
            console.log(`Message from client in room ${roomid}:`, message);
            socket.to(roomid).emit("receiveMessage", message);
        });

        // Handle disconnect event
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};
