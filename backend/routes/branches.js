const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/branches - Fetch all store branches
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM branches ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
});

module.exports = router;
