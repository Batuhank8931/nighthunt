const path = require("path");
const fs = require("fs");

module.exports = (io) => {
    const filePath = path.join(__dirname, "../jsons/gamers.json");

    fs.watch(filePath, (eventType, filename) => {
        if (eventType === "change") {
            console.log(`File ${filename} has been updated, sending gamer data...`);

            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading file:", err);
                    return;
                }

                try {
                    const jsonData = JSON.parse(data);

                    if (Array.isArray(jsonData)) {
                        // Group gamers by roomid
                        const roomData = jsonData.reduce((acc, gamer) => {
                            const roomid = gamer.roomid;
                            if (!acc[roomid]) acc[roomid] = [];
                            acc[roomid].push(gamer);
                            return acc;
                        }, {});
                        
                        Object.keys(roomData).forEach((roomid) => {
                            io.to(roomid).emit("gamerData", roomData[roomid], roomid);  // Send roomid along with the data
                            console.log(`Emitted gamer data for room ${roomid}:`, roomData[roomid]);
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
