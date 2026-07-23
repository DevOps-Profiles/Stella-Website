const express = require('express');
const router = express.Router();
const db = require('../db');

const defaultBranches = [
    { name: 'Unit I, Hongkong Plaza', address: '18A/65, Hongkong Plaza, Tuticorin - 628 002', phone_number: '+91 9095510510' },
    { name: 'Unit II, Hongkong Plaza', address: '18A/22, Hongkong Plaza, Tuticorin - 628 002', phone_number: '+91 9095510510' },
    { name: 'Thalamuthunagar', address: '14/681, Thalamuthu Nagar Main Road, Thoothukudi - 628 002', phone_number: '+91 9095510510' },
    { name: 'Chidambara Nagar', address: 'East Coast Rd, Chidambara Nagar, Subbiah Puram, Thoothukudi, Tamil Nadu - 628 001', phone_number: '+91 9095510510' },
    { name: 'Kulathur', address: 'Shop No. 01, Bus stand inside, Kulathur, Thoothukudi - 628 903', phone_number: '+91 9095510510' },
    { name: 'Stella Hitech Mobiles, Pudukottai', address: 'JBR Complex, 3/416/32, Theri Rd, Pudukottai, Tamil Nadu – 628 103', phone_number: '+91 9095510510' },
    { name: 'Stella Hitech Mobiles, Kulathur', address: 'V.M.S.T. Raj Complex, Behind Kulathur Bus stand, Kulathur, Tamil Nadu – 628 903', phone_number: '+91 9095510510' },
    { name: 'MR.93 Hi Tech Mobiles', address: '149/8, Polepettai, 4th Gate, Ettayapuram Road, Muthammal Colony, Thoothukudi - 628 002', phone_number: '+91 9095510510' }
];

async function ensureDefaultBranches() {
    try {
        for (const b of defaultBranches) {
            const exist = await db.query('SELECT id FROM branches WHERE name = $1', [b.name]);
            if (exist.rows.length === 0) {
                await db.query('INSERT INTO branches (name, address, phone_number) VALUES ($1, $2, $3)', [b.name, b.address, b.phone_number]);
            }
        }
    } catch (err) {
        console.error('Error ensuring default branches:', err);
    }
}
ensureDefaultBranches();

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
