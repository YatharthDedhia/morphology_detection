const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 4000;

app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'yatharthdedhia',
    password: 'root',
    database: 'seimages',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
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
        if (err) throw err;
        res.json(results);
    });
});

// Add a new image
app.post('/images', (req, res) => {
    const { url } = req.body;
    const query = 'INSERT INTO images (url) VALUES (?)';
    db.query(query, [url], (err, results) => {
        if (err) throw err;
        res.json({ id: results.insertId, url });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
