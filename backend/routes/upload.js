const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('../db/index'); // Make sure to require db

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST upload single image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const { buffer, mimetype, originalname } = req.file;

        // Insert the file buffer into the uploaded_images table
        const result = await db.query(
            'INSERT INTO uploaded_images (data, mime_type, original_name) VALUES (?, ?, ?)',
            [buffer, mimetype, originalname]
        );

        // Return the new URL format pointing to our new image serving endpoint
        const fileUrl = `/api/images/${result.insertId}`;
        res.json({ success: true, url: fileUrl });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
});

module.exports = router;
