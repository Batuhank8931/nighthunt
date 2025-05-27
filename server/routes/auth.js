const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const loginpage = express.Router();

const JWT_SECRET = crypto.randomBytes(32).toString('hex');

// File paths for storing login details and users
const loginFilePath = path.join(__dirname, '../jsons/login_tokens.json');
const usersFilePath = path.join(__dirname, '../jsons/users.json');

// Add the middleware for JSON body parsing
app.use(express.json());

// Ensure login_tokens.json exists, if not create it
if (!fs.existsSync(loginFilePath)) {
    fs.writeFileSync(loginFilePath, JSON.stringify([])); // Initialize an empty array if the file doesn't exist
}

// Ensure users.json exists, if not create it
if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([])); // Initialize an empty array if the file doesn't exist
}

loginpage.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Read users data from the users.json file
    const users = JSON.parse(fs.readFileSync(usersFilePath));

    // Check if the username and password match any user in the users array
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        const payload = { username };

        // Sign the token with the fixed JWT_SECRET
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        const uniqueId = user.useruniqueid

        // Prepare data to save
        const loginData = {
            username,
            password, // You might want to hash the password here for security purposes
            token,
            createdAt: new Date().toISOString(), // Store the creation date
        };

        // Read existing login data from the file
        let existingData = JSON.parse(fs.readFileSync(loginFilePath));

        // Remove the record with the same username and password (if it exists)
        existingData = existingData.filter(item => !(item.username === username && item.password === password));

        // Add new login data
        existingData.push(loginData);

        // Save updated data to the file
        fs.writeFileSync(loginFilePath, JSON.stringify(existingData, null, 2));

        res.json({ token, uniqueId });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

module.exports = loginpage;
