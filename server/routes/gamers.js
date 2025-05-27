const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const os = require('os');  // Import os module to get local IP

const GamersLogin = express.Router();
const gamersFilePath = path.join(__dirname, '../jsons/gamers.json'); // Use absolute path

const JWT_SECRET = crypto.randomBytes(32).toString('hex');

GamersLogin.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const details of iface) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address; // Return the first non-internal IPv4 address
            }
        }
    }
    return 'localhost'; // Fallback if no local IP is found
};

const localIp = getLocalIp(); // Get the local IP address
const PORT = 3050; // Ensure this matches your server's running port

const verifyToken = (req, res, next) => {

    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

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

        // Find the user with the matching token
        const gamer = gamers.find(user => user.token === token);

        if (!gamer) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        req.user = gamer.gamername;
        next();
    });
};

// Ensure gamers.json exists and is not empty
function readGamersFile() {
    try {
        const data = fs.readFileSync(gamersFilePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error("Error reading gamers.json:", err);
        return []; // Return empty array if file is missing or invalid
    }
}

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqpictureId = crypto.randomUUID(); // Generate a unique ID inside filename function
        req.uniqpictureId = uniqpictureId; // Store it in request object for later use
        const filename = `${uniqpictureId}${ext}`; // Use the generated ID in filename
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG and PNG files are allowed'));
        }
    }
});

// Route to check user login status
GamersLogin.get('/api/logingamer', verifyToken, (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const gamersFilePath = path.join(__dirname, '../jsons/gamers.json');

    fs.readFile(gamersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading gamers.json' });
        }

        let existingData;
        try {
            existingData = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ message: 'Error parsing gamers.json' });
        }

        // Find the gamer based on the token
        const gamer = existingData.find(item => item.token === token);
        if (!gamer) {
            return res.status(404).json({ message: "Gamer not found" });
        }

        // Construct profile image URL with the local IP address
        const imageUrl = `http://${localIp}:${PORT}/uploads/${encodeURIComponent(gamer.profileImage)}`;

        res.json({ message: "Gamer found", gamer: { ...gamer, profileImageUrl: imageUrl } });
    });
});

// Login route with image upload
GamersLogin.post('/api/logingamer', upload.single('profileImage'), (req, res) => {

    const { gamername, roomid } = req.body;

    if (!gamername || !roomid) {
        return res.status(400).json({ message: "Gamername and Room ID are required" });
    }

    const profileImage = req.file ? req.file.filename : null; // Store filename
    const token = jwt.sign({ gamername }, JWT_SECRET, { expiresIn: '1h' });
    const imageUrl = `http://${localIp}:${PORT}/uploads/${encodeURIComponent(profileImage)}`;

    // Generate unique gamer ID
    const uniqgamerId = crypto.randomUUID();

    // Prepare login data
    const loginData = {
        gamername,
        roomid,
        uniqgamerId,
        token,
        profileImage,
        imageUrl,
        createdAt: new Date().toISOString(),
    };

    // Read existing login data
    let existingData = readGamersFile();

    // Remove previous login record for the same gamer
    existingData = existingData.filter(item => item.gamername !== gamername);

    // Add new login data
    existingData.push(loginData);

    // Save updated data safely
    try {
        fs.writeFileSync(gamersFilePath, JSON.stringify(existingData, null, 2));
    } catch (err) {
        console.error("Error writing to gamers.json:", err);
        return res.status(500).json({ message: "Internal server error" });
    }

    res.json({ token, uniqgamerId, profileImage });
});

// Login route with image upload
GamersLogin.post('/api/loginmaingamer', upload.single('profileImage'), (req, res) => {
    const { gamername, roomid } = req.body;
    const token = req.headers['authorization']?.split(' ')[1];

    if (!gamername || !roomid) {
        return res.status(400).json({ message: "Gamername and Room ID are required" });
    }

    // Read existing login data
    let existingData = readGamersFile();

    // Check if the gamername already exists in the same room
    const existingGamer = existingData.find(item => item.gamername === gamername && item.roomid === roomid);
    if (existingGamer) {
        return res.status(400).json({ message: "Bu kullanıcı adı kullanılıyor" });
    }

    const profileImage = req.file ? req.file.filename : null; // Store filename
    const imageUrl = `http://${localIp}:${PORT}/uploads/${encodeURIComponent(profileImage)}`;

    // Generate unique gamer ID
    const uniqgamerId = crypto.randomUUID();

    // Prepare login data
    const loginData = {
        gamername,
        roomid,
        uniqgamerId,
        token,
        profileImage,
        imageUrl,
        createdAt: new Date().toISOString(),
    };

    // Remove previous login record for the same gamer
    existingData = existingData.filter(item => item.gamername !== gamername);

    // Add new login data
    existingData.push(loginData);

    // Save updated data safely
    try {
        fs.writeFileSync(gamersFilePath, JSON.stringify(existingData, null, 2));
    } catch (err) {
        console.error("Error writing to gamers.json:", err);
        return res.status(500).json({ message: "Internal server error" });
    }

    res.json({ token, uniqgamerId, profileImage });
});


// Route to update gamername or profileImageUrl or both
GamersLogin.put('/api/logingamer', verifyToken, upload.single('profileImage'), (req, res) => {
    const { gamername, roomid, profileImageUrl } = req.body;
    const token = req.headers['authorization']?.split(' ')[1];

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

        // Find the gamer by token
        const gamerIndex = gamers.findIndex(gamer => gamer.token === token);
        if (gamerIndex === -1) {
            return res.status(404).json({ message: 'Gamer not found' });
        }

        // Check if the new gamername already exists in the same room
        if (gamername) {
            const existingGamer = gamers.find(
                gamer => gamer.gamername === gamername && gamer.roomid === roomid && gamer.token !== token
            );
            if (existingGamer) {
                return res.status(400).json({ message: 'Bu kullanıcı adı kullanılıyor' });
            }
            gamers[gamerIndex].gamername = gamername;
        }

        // If a new profile image is uploaded, handle the file and save its path
        if (req.file) {
            const oldImageUrl = gamers[gamerIndex].profileImage;

            if (oldImageUrl) {
                const oldImagePath = path.join(__dirname, '../uploads', path.basename(oldImageUrl));

                // Delete the old image file
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error("Error deleting old image:", err);
                    } else {
                        console.log("Old image deleted successfully:", oldImagePath);
                    }
                });
            }

            const profileImage = req.file.filename; // Store filename
            const imageUrl = `http://${localIp}:${PORT}/uploads/${encodeURIComponent(profileImage)}`;
            gamers[gamerIndex].profileImage = profileImage;
            gamers[gamerIndex].imageUrl = imageUrl;
        }

        // Write the updated gamers data back to the file
        fs.writeFile(gamersFilePath, JSON.stringify(gamers, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error saving updated gamer data' });
            }

            res.json({ message: 'Gamer updated successfully', gamer: gamers[gamerIndex] });
        });
    });
});


// Route to check user login status
GamersLogin.post('/api/getoldgamer', (req, res) => {
    const { gamername, roomid } = req.body;

    if (!gamername || !roomid) {
        return res.status(400).json({ message: 'gamername and roomid are required' });
    }

    const gamersFilePath = path.join(__dirname, '../jsons/gamers.json');

    fs.readFile(gamersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading gamers.json' });
        }

        let existingData;
        try {
            existingData = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ message: 'Error parsing gamers.json' });
        }

        // Check if there is a gamer with the same gamername and roomid
        const gamer = existingData.find(item => item.gamername === gamername && item.roomid === roomid);

        if (!gamer) {
            return res.status(404).json({ message: "Gamer not found" });
        }

        // Construct profile image URL
        const imageUrl = `http://${localIp}:${PORT}/uploads/${encodeURIComponent(gamer.profileImage)}`;

        res.json({
            message: "Gamer found",
            gamername: gamer.gamername,
            token: gamer.token,
            imageUrl: imageUrl
        });
    });
});





module.exports = GamersLogin;
