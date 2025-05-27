const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const roompage = express.Router();

// Middleware to verify the JWT token from login_tokens.json
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Read the login_tokens.json file to get stored tokens
    const loginFilePath = path.join(__dirname, '../jsons/login_tokens.json');
    fs.readFile(loginFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading login tokens' });
        }

        const loginTokens = JSON.parse(data);

        // Find if the token exists in the stored tokens
        const tokenData = loginTokens.find(item => item.token === token);

        if (!tokenData) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = tokenData.username;
        next(); // Proceed to the next middleware or route handler
    });
};

// Use the verifyToken middleware to protect the /api/room route
roompage.post('/api/room', verifyToken, (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { useruniqueId, username, room_name } = req.body;

    const gamers = 0;

    const uniqueId = Date.now().toString();
    const createdAt = new Date().toISOString();
    const usertoken = token
    const userid = useruniqueId

    // Data to be saved
    const roomData = {
        username,
        userid,
        room_name,
        uniqueId,
        createdAt,
        usertoken,
        gamers
    };

    // Define the file path where the data will be stored
    const filePath = path.join(__dirname, '../jsons/rooms.json');

    // Read existing data from the JSON file (if it exists)
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // If the file doesn't exist or there's an error, initialize with an empty array
            const rooms = [];
            rooms.push(roomData);

            // Write new data to the file
            fs.writeFile(filePath, JSON.stringify(rooms, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error saving room data' });
                }
                return res.status(200).json({ message: 'Room data saved successfully', roomData });
            });
        } else {
            // If file exists, append new data to the existing array
            const rooms = JSON.parse(data);
            rooms.push(roomData);

            // Write updated data to the file
            fs.writeFile(filePath, JSON.stringify(rooms, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error saving room data' });
                }
                return res.status(200).json({ message: 'Room data saved successfully', roomData });
            });
        }
    });
});

roompage.get('/api/room/:userid', verifyToken, (req, res) => {
    const { userid } = req.params;
    const roomsFilePath = path.join(__dirname, '../jsons/rooms.json');
    const gamersFilePath = path.join(__dirname, '../jsons/gamers.json');

    // Read rooms.json
    fs.readFile(roomsFilePath, 'utf8', (err, roomsData) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading room data' });
        }

        try {
            const rooms = JSON.parse(roomsData);
            const userRooms = rooms.filter(room => room.userid === userid);

            if (userRooms.length === 0) {
                return res.status(200).json({ rooms: [], gamers: [] });
            }

            // Extract room IDs
            const roomIds = userRooms.map(room => room.uniqueId);
            // Read gamers.json
            fs.readFile(gamersFilePath, 'utf8', (err, gamersData) => {

                if (err) {
                    return res.status(500).json({ message: 'Error reading gamer data' });
                }

                try {
                    const gamers = JSON.parse(gamersData);

                    const filteredGamers = gamers.filter(gamer => roomIds.includes(gamer.roomid));
                    return res.status(200).json({ rooms: userRooms, gamers: filteredGamers });
                } catch (error) {
                    return res.status(500).json({ message: 'Error parsing gamer data' });
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error parsing room parsing' });
        }
    });
});


roompage.delete('/api/room/:roomId', verifyToken, (req, res) => {
    const { roomId } = req.params;

    const roomFilePath = path.join(__dirname, '../jsons/rooms.json');
    const gamersFilePath = path.join(__dirname, '../jsons/gamers.json');

    // Read the rooms.json file
    fs.readFile(roomFilePath, 'utf8', (err, roomData) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading room data' });
        }

        try {
            let rooms = JSON.parse(roomData);
            rooms = rooms.filter(room => room.uniqueId !== roomId);

            // Write the updated rooms data back
            fs.writeFile(roomFilePath, JSON.stringify(rooms, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error saving room data' });
                }

                // Now delete gamers with the same roomId
                fs.readFile(gamersFilePath, 'utf8', (err, gamerData) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error reading gamers data' });
                    }

                    try {
                        let gamers = JSON.parse(gamerData);
                        const updatedGamers = gamers.filter(gamer => gamer.roomid !== roomId);
                        const deletedCount = gamers.length - updatedGamers.length;

                        // Write the updated gamers data back
                        fs.writeFile(gamersFilePath, JSON.stringify(updatedGamers, null, 2), (err) => {
                            if (err) {
                                return res.status(500).json({ message: 'Error saving updated gamers data' });
                            }

                            return res.status(200).json({
                                message: 'Room and associated gamers deleted successfully',
                                deletedGamersCount: deletedCount
                            });
                        });
                    } catch (error) {
                        return res.status(500).json({ message: 'Error parsing gamers data' });
                    }
                });
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error parsing room data' });
        }
    });
});

// Route to delete gamer by uniqgamerId
roompage.delete('/api/deletegamer/:uniqgamerId', verifyToken, (req, res) => {

    const { uniqgamerId } = req.params;

    const gamersFilePath = path.join(__dirname, '../jsons/gamers.json');

    fs.readFile(gamersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading gamers.json' });
        }

        let gamers;
        try {
            gamers = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ message: 'Error parsing gamers.json' });
        }

        const gamerToDeleteIndex = gamers.findIndex(gamer => gamer.uniqgamerId === uniqgamerId);
        if (gamerToDeleteIndex === -1) {
            return res.status(404).json({ message: 'Gamer with the given uniqgamerId not found' });
        }

        // Optionally delete the profile image if it exists
        const oldImageUrl = gamers[gamerToDeleteIndex].profileImage;
        if (oldImageUrl) {
            const oldImagePath = path.join(__dirname, '../uploads', path.basename(oldImageUrl));
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error("Error deleting old image:", err);
                } else {
                    console.log("Old image deleted successfully:", oldImagePath);
                }
            });
        }

        // Remove the gamer from the array
        gamers.splice(gamerToDeleteIndex, 1);

        // Write the updated gamers data back to the file
        fs.writeFile(gamersFilePath, JSON.stringify(gamers, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error saving updated gamer data' });
            }

            res.json({ message: 'Gamer deleted successfully' });
        });
    });
});



module.exports = roompage;
