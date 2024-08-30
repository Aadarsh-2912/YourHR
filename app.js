const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Connect to MongoDB without deprecated options
mongoose.connect('mongodb://localhost:27017/yourhr')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Define the User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    city: String,
    resume: String // Store resume file path
});

const User = mongoose.model('User', userSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle form submission
app.post('/signup', upload.single('resume'), async (req, res) => {
    try {
        const { name, email, password, phone, city } = req.body;
        const resume = req.file ? req.file.path : '';

        // Validate required fields
        if (!name || !email || !password || !phone || !city) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create new user and save to database
        const newUser = new User({ name, email, password, phone, city, resume });
        await newUser.save();

        res.json({ message: 'Data successfully uploaded' });
    } catch (error) {
        console.error('Error occurred:', error); // Log error details
        res.status(500).json({ message: 'An error occurred. Please try again.', error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
