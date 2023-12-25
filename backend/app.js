const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 4000;

// Use cors middleware to handle Cross-Origin Resource Sharing
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'yatharthdedhia',
    password: 'root',
    database: 'seimages',
});

// Handle MySQL connection errors
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1); // Exit the application if unable to connect to the database
    }
    console.log('Connected to MySQL');
});

// Middleware
app.use(bodyParser.json());

// Routes

// Get all images
app.get('/images', (req, res) => {
    const query = 'SELECT * FROM images';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching images:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
});

// Add a new image
app.post('/images', (req, res) => {
    const { url } = req.body;
    const query = 'INSERT INTO images (url) VALUES (?)';
    db.query(query, [url], (err, results) => {
        if (err) {
            console.error('Error adding image:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.json({ id: results.insertId, url });
    });
});

// User registration endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Insert user into MySQL database
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error('Error during registration:', err);
            res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
            return;
        }
        console.log('User registered');
        res.json({ success: true, message: 'Registration successful.' });
    });
});

// User login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if user exists in MySQL database
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }

        if (result.length > 0) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect username or password' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
