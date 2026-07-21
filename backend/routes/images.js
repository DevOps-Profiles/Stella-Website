const express = require('express');
const router = express.Router();
const db = require('../db/index'); // Use the DB pool

// GET serve single image from DB
router.get('/:id', async (req, res) => {
    try {
        const imageId = req.params.id;
        
        // Ensure imageId is numeric
        if (isNaN(imageId)) {
            return res.status(400).send('Invalid image ID');
        }
        
        const { rows } = await db.query('SELECT data, mime_type, original_name FROM uploaded_images WHERE id = ?', [imageId]);
        
        if (!rows || rows.length === 0) {
            return res.status(404).send('Image not found');
        }
        
        const image = rows[0];
        
        // Set caching headers to cache aggressively (1 year)
        res.setHeader('Content-Type', image.mime_type);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        
        // Send the raw binary buffer
        res.send(image.data);
    } catch (error) {
        console.error('Error fetching image from DB:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
