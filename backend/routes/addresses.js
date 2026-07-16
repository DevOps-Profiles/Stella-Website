const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/addresses/user/:userId - Retrieve all addresses for a user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching addresses:', err);
        res.status(500).json({ error: 'Failed to fetch addresses', details: err.message });
    }
});

// POST /api/addresses - Add a new address
router.post('/', async (req, res) => {
    const { user_id, street_address, city, state, postal_code, is_default, landmark, address_name } = req.body;

    if (!user_id || !street_address || !city || !state || !postal_code) {
        return res.status(400).json({ error: 'All required address fields must be filled' });
    }

    try {
        // If this address is set as default, unset other defaults for this user
        if (is_default) {
            await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [user_id]);
        } else {
            // If it's the user's first address, make it the default automatically
            const countRes = await db.query('SELECT COUNT(*) FROM addresses WHERE user_id = $1', [user_id]);
            if (parseInt(countRes.rows[0].count) === 0) {
                req.body.is_default = true;
            }
        }

        const finalIsDefault = req.body.is_default || false;

        const result = await db.query(
            `INSERT INTO addresses (user_id, street_address, city, state, postal_code, is_default, landmark, address_name)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [user_id, street_address, city, state, postal_code, finalIsDefault, landmark || null, address_name || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating address:', err);
        res.status(500).json({ error: 'Failed to create address', details: err.message });
    }
});

// PUT /api/addresses/:id - Edit an address
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { street_address, city, state, postal_code, is_default, landmark, address_name } = req.body;

    if (!street_address || !city || !state || !postal_code) {
        return res.status(400).json({ error: 'All required address fields must be filled' });
    }

    try {
        // Fetch current address to verify existence and get user_id
        const addrRes = await db.query('SELECT user_id FROM addresses WHERE id = $1', [id]);
        if (addrRes.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }
        
        const user_id = addrRes.rows[0].user_id;

        // If this address is updated to be the default, reset other addresses' default status
        if (is_default) {
            await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [user_id]);
        }

        const result = await db.query(
            `UPDATE addresses 
             SET street_address = $1, city = $2, state = $3, postal_code = $4, is_default = $5, landmark = $6, address_name = $7
             WHERE id = $8
             RETURNING *`,
            [street_address, city, state, postal_code, is_default || false, landmark || null, address_name || null, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).json({ error: 'Failed to update address', details: err.message });
    }
});

// DELETE /api/addresses/:id - Remove an address
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the address exists
        const addrRes = await db.query('SELECT user_id, is_default FROM addresses WHERE id = $1', [id]);
        if (addrRes.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }

        const { user_id, is_default } = addrRes.rows[0];

        await db.query('DELETE FROM addresses WHERE id = $1', [id]);

        // If the deleted address was default, set the next most recently added address as default
        if (is_default) {
            const nextAddr = await db.query(
                'SELECT id FROM addresses WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
                [user_id]
            );
            if (nextAddr.rows.length > 0) {
                await db.query('UPDATE addresses SET is_default = true WHERE id = $1', [nextAddr.rows[0].id]);
            }
        }

        res.json({ success: true, message: 'Address removed successfully' });
    } catch (err) {
        console.error('Error deleting address:', err);
        res.status(500).json({ error: 'Failed to delete address', details: err.message });
    }
});

module.exports = router;
