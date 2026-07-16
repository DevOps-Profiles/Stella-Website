const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Mock Mode config
const MOCK_OTP = '123456';
const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY;

// POST /api/auth/check-user
// Checks if a user already exists with this phone number
router.post('/check-user', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

    try {
        const result = await db.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
        res.json({ exists: result.rows.length > 0 });
    } catch (err) {
        console.error('Check user error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/auth/send-otp
// Sends OTP using 2Factor.in
router.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

    try {
        if (!TWO_FACTOR_API_KEY) {
            console.log(`[Mock Auth] Sending mock OTP '${MOCK_OTP}' to ${phoneNumber}`);
            return res.json({ success: true, sessionId: 'mock-session-id', mock: true });
        }

        const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${phoneNumber}/AUTOGEN`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.Status === 'Success') {
            res.json({ success: true, sessionId: data.Details });
        } else {
            res.status(400).json({ error: 'Failed to send OTP via 2Factor', details: data });
        }
    } catch (err) {
        console.error('2Factor Send Error:', err);
        res.status(500).json({ error: 'Failed to send OTP', details: err.message });
    }
});

// Internal helper to verify OTP
async function verifyOtpInternally(phoneNumber, code) {
    if (!TWO_FACTOR_API_KEY) {
        return code === MOCK_OTP;
    }
    const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/VERIFY3/${phoneNumber}/${code}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.Status === 'Success';
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { phoneNumber, password, code, name } = req.body;

    if (!phoneNumber || !password || !code) {
        return res.status(400).json({ error: 'Phone number, password, and OTP code are required' });
    }

    try {
        // 1. Verify OTP
        const isValid = await verifyOtpInternally(phoneNumber, code);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Insert User
        let userResult = await db.query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
        if (userResult.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = await db.query(
            'INSERT INTO users (name, phone_number, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [name || 'Stella Customer', phoneNumber, passwordHash]
        );
        const user = newUser.rows[0];

        res.json({ 
            success: true, 
            message: 'Registration successful', 
            user: { id: user.id, name: user.name, phone: user.phone_number, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Registration failed', details: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' });
    }

    try {
        // Hardcoded admin bypass
        if (phoneNumber.toLowerCase() === 'admin@stellahitech.com' && password === 'StellaHO10@') {
            return res.json({ 
                success: true, 
                message: 'Admin login successful', 
                user: { id: 9999, name: 'Admin', phone: '0000000000', email: 'admin@stellahitech.com', role: 'admin' }
            });
        }

        const result = await db.query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid phone number or password' });
        }

        const user = result.rows[0];

        // Check password
        if (!user.password_hash) {
            return res.status(400).json({ error: 'Please reset your password to continue' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid phone number or password' });
        }

        res.json({ 
            success: true, 
            message: 'Login successful', 
            user: { id: user.id, name: user.name, phone: user.phone_number, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { phoneNumber, newPassword, code } = req.body;

    if (!phoneNumber || !newPassword || !code) {
        return res.status(400).json({ error: 'Phone number, new password, and OTP code are required' });
    }

    try {
        // 1. Verify OTP
        const isValid = await verifyOtpInternally(phoneNumber, code);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // 2. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // 3. Update User
        const result = await db.query(
            'UPDATE users SET password_hash = $1 WHERE phone_number = $2',
            [passwordHash, phoneNumber]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ error: 'Failed to reset password', details: err.message });
    }
});

// PUT /api/auth/profile/:id
router.put('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
        const result = await db.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email || null, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = result.rows[0];

        res.json({
            success: true,
            user: { id: user.id, name: user.name, phone: user.phone_number, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
});

// PUT /api/auth/update-password/:id  (For logged in users in their profile)
router.put('/update-password/:id', async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = result.rows[0];

        // Check current password
        if (user.password_hash) {
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Incorrect current password' });
            }
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('Update Password Error:', err);
        res.status(500).json({ error: 'Failed to update password', details: err.message });
    }
});

// GET /api/auth/users
router.get('/users', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, phone_number, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, users: result.rows });
    } catch (err) {
        console.error('Fetch Users Error:', err);
        res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
});

module.exports = router;
